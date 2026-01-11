const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const paths = require('./paths');

// 写入队列：防止对同一个文件同时发起多次写入导致文件损坏
const writeQueues = new Map();

// 临时文件缓存管理器
const tempFileCache = new Map(); // articleId -> { tempPath, lastSaveTime, timer, filePath }
const TEMP_FILE_SUFFIX = '.cache.tmp';
const CACHE_SAVE_INTERVAL = 60000; // 1分钟 = 60000毫秒

// 使用安装目录下的 tmp 目录作为临时文件目录
const TEMP_DIR = paths.tmp;
// 确保临时目录存在
fs.ensureDirSync(TEMP_DIR);

/**
 * 生成临时文件路径（使用安装目录下的 tmp 目录）
 * @param {string} filePath - 正式文件路径
 * @returns {string} - 临时文件路径
 */
function getTempFilePath(filePath) {
    // 使用文件路径的哈希值作为临时文件名，避免路径冲突
    const hash = crypto.createHash('md5').update(filePath).digest('hex');
    const fileName = path.basename(filePath);
    return path.join(TEMP_DIR, `${hash}-${fileName}${TEMP_FILE_SUFFIX}`);
}

/**
 * 原子写入 (Atomic Write)
 * 原理：先写入 .tmp 临时文件，写入完成后瞬间重命名替换原文件。
 * 优势：1. 杜绝文件写到一半软件崩溃导致内容丢失。
 * 2. 解决 Windows 下的文件锁死 (EBUSY) 问题。
 */
async function atomicWrite(filePath, content) {
    const tempPath = `${filePath}.tmp.${Date.now()}`;
    
    try {
        // 1. 异步写入临时文件 (不阻塞主线程)
        await fs.outputFile(tempPath, content, 'utf-8');
        
        // 2. 瞬间替换 (Rename 操作是原子的)
        await fs.move(tempPath, filePath, { overwrite: true });
    } catch (error) {
        // 如果出错，尝试清理临时文件
        if (await fs.pathExists(tempPath)) {
            await fs.remove(tempPath);
        }
        throw error; // 抛出错误供上层处理
    }
}

/**
 * 队列写入管理器
 * 确保对同一个文件的写入操作是串行的 (First-In-First-Out)
 */
async function queueWrite(filePath, content) {
    // 获取该文件的当前队列，如果没有则新建一个 Resolved Promise
    let previousOp = writeQueues.get(filePath) || Promise.resolve();

    // 创建新的写入任务，必须等待上一个任务完成
    const currentOp = previousOp
        .then(() => atomicWrite(filePath, content))
        .catch((err) => {
            console.error(`[IO Error] Failed to write ${filePath}:`, err);
            // 这里吞掉错误，防止队列中断，实际业务中可根据需求决定是否抛出
        });

    // 更新队列指针
    writeQueues.set(filePath, currentOp);

    // 等待当前任务完成
    return currentOp;
}

/**
 * 保存到临时文件缓存（异步，不阻塞）
 * @param {string} articleId - 文章ID
 * @param {string} filePath - 正式文件路径
 * @param {string} content - 内容
 */
async function saveToTempCache(articleId, filePath, content) {
    try {
        const tempPath = filePath + TEMP_FILE_SUFFIX;
        // 直接写入临时文件，不经过队列（因为是缓存，可以快速写入）
        await fs.outputFile(tempPath, content, 'utf-8');
        
        // 更新缓存记录
        const cacheInfo = tempFileCache.get(articleId);
        if (cacheInfo) {
            cacheInfo.lastSaveTime = Date.now();
        }
        
        console.log(`[Cache] Saved to temp file: ${tempPath}`);
    } catch (error) {
        console.error(`[Cache] Failed to save temp file for ${articleId}:`, error);
    }
}

/**
 * 从临时文件恢复内容（如果存在）
 * @param {string} filePath - 正式文件路径
 * @returns {string|null} - 临时文件内容，如果不存在返回null
 */
async function loadFromTempCache(filePath) {
    try {
        const tempPath = getTempFilePath(filePath);
        if (await fs.pathExists(tempPath)) {
            const content = await fs.readFile(tempPath, 'utf-8');
            console.log(`[Cache] Loaded from temp file: ${tempPath}`);
            return content;
        }
        // 兼容旧版本：检查文档目录中的临时文件（迁移到安装目录的 tmp 目录）
        const oldTempPath = filePath + TEMP_FILE_SUFFIX;
        if (await fs.pathExists(oldTempPath)) {
            const content = await fs.readFile(oldTempPath, 'utf-8');
            // 迁移到安装目录的 tmp 目录
            const newTempPath = getTempFilePath(filePath);
            await fs.move(oldTempPath, newTempPath, { overwrite: true });
            console.log(`[Cache] Migrated temp file from ${oldTempPath} to ${newTempPath}`);
            return content;
        }
        
        // 兼容旧版本：检查系统临时目录中的临时文件（迁移到安装目录的 tmp 目录）
        try {
            const os = require('os');
            const systemTempDir = path.join(os.tmpdir(), 'ymhut-write-cache');
            const hash = crypto.createHash('md5').update(filePath).digest('hex');
            const fileName = path.basename(filePath);
            const oldSystemTempPath = path.join(systemTempDir, `${hash}-${fileName}${TEMP_FILE_SUFFIX}`);
            if (await fs.pathExists(oldSystemTempPath)) {
                const content = await fs.readFile(oldSystemTempPath, 'utf-8');
                // 迁移到安装目录的 tmp 目录
                const newTempPath = getTempFilePath(filePath);
                await fs.move(oldSystemTempPath, newTempPath, { overwrite: true });
                console.log(`[Cache] Migrated temp file from ${oldSystemTempPath} to ${newTempPath}`);
                return content;
            }
        } catch (err) {
            // 忽略迁移错误
        }
    } catch (error) {
        console.error(`[Cache] Failed to load temp file:`, error);
    }
    return null;
}

/**
 * 同步临时文件到正式文件并删除临时文件
 * @param {string} articleId - 文章ID
 * @param {string} filePath - 正式文件路径
 * @returns {Promise<boolean>} - 是否成功同步
 */
async function syncTempToFile(articleId, filePath) {
    try {
        const tempPath = getTempFilePath(filePath);
        
        // 检查临时文件是否存在
        if (await fs.pathExists(tempPath)) {
            // 读取临时文件内容
            const content = await fs.readFile(tempPath, 'utf-8');
            
            // 使用队列写入正式文件（确保原子性）
            await queueWrite(filePath, content);
            
            // 删除临时文件
            await fs.remove(tempPath);
            
            // 清除缓存记录
            const cacheInfo = tempFileCache.get(articleId);
            if (cacheInfo && cacheInfo.timer) {
                clearInterval(cacheInfo.timer);
            }
            tempFileCache.delete(articleId);
            
            console.log(`[Cache] Synced and removed temp file: ${tempPath}`);
            return true;
        }
        
        // 兼容旧版本：检查文档目录中的临时文件（迁移并同步）
        const oldTempPath = filePath + TEMP_FILE_SUFFIX;
        if (await fs.pathExists(oldTempPath)) {
            const content = await fs.readFile(oldTempPath, 'utf-8');
            await queueWrite(filePath, content);
            await fs.remove(oldTempPath);
            const cacheInfo = tempFileCache.get(articleId);
            if (cacheInfo && cacheInfo.timer) {
                clearInterval(cacheInfo.timer);
            }
            tempFileCache.delete(articleId);
            console.log(`[Cache] Synced and removed old temp file: ${oldTempPath}`);
            return true;
        }
        
        // 兼容旧版本：检查系统临时目录中的临时文件（迁移并同步）
        try {
            const os = require('os');
            const systemTempDir = path.join(os.tmpdir(), 'ymhut-write-cache');
            const hash = crypto.createHash('md5').update(filePath).digest('hex');
            const fileName = path.basename(filePath);
            const oldSystemTempPath = path.join(systemTempDir, `${hash}-${fileName}${TEMP_FILE_SUFFIX}`);
            if (await fs.pathExists(oldSystemTempPath)) {
                const content = await fs.readFile(oldSystemTempPath, 'utf-8');
                await queueWrite(filePath, content);
                await fs.remove(oldSystemTempPath);
                const cacheInfo = tempFileCache.get(articleId);
                if (cacheInfo && cacheInfo.timer) {
                    clearInterval(cacheInfo.timer);
                }
                tempFileCache.delete(articleId);
                console.log(`[Cache] Synced and removed old system temp file: ${oldSystemTempPath}`);
                return true;
            }
        } catch (err) {
            // 忽略兼容性检查错误
        }
        
        return false;
    } catch (error) {
        console.error(`[Cache] Failed to sync temp file for ${articleId}:`, error);
        return false;
    }
}

/**
 * 启动定时保存到临时文件
 * 注意：实际内容由前端的 save-article 提供，定时器主要用于标记和管理
 * @param {string} articleId - 文章ID
 * @param {string} filePath - 正式文件路径
 * @param {Function} getContent - 获取当前内容的函数（可选，主要用于兼容）
 */
function startTempCacheTimer(articleId, filePath, getContent) {
    // 清除旧的定时器
    const oldCache = tempFileCache.get(articleId);
    if (oldCache && oldCache.timer) {
        clearInterval(oldCache.timer);
    }
    
    // 保存缓存信息（定时器由前端管理，这里只记录信息）
    const tempPath = getTempFilePath(filePath);
    tempFileCache.set(articleId, {
        tempPath: tempPath,
        lastSaveTime: Date.now(),
        timer: null, // 定时器由前端管理，这里不创建
        filePath: filePath
    });
    
    console.log(`[Cache] Registered cache for article: ${articleId}, tempPath: ${tempPath}`);
}

/**
 * 停止定时保存并清理临时文件
 * @param {string} articleId - 文章ID
 */
function stopTempCacheTimer(articleId) {
    const cacheInfo = tempFileCache.get(articleId);
    if (cacheInfo) {
        if (cacheInfo.timer) {
            clearInterval(cacheInfo.timer);
        }
        tempFileCache.delete(articleId);
        console.log(`[Cache] Stopped temp cache timer for article: ${articleId}`);
    }
}

/**
 * 清理所有临时文件（应用退出时调用）
 * 会先同步所有临时文件到正式文件，然后删除临时文件
 */
async function cleanupAllTempFiles() {
    try {
        console.log('[Cache] Starting cleanup of all temp files...');
        const syncPromises = [];
        
        // 先同步所有临时文件到正式文件
        for (const [articleId, cacheInfo] of tempFileCache.entries()) {
            if (cacheInfo.timer) {
                clearInterval(cacheInfo.timer);
            }
            
            // 如果有临时文件，尝试同步到正式文件
            if (cacheInfo.filePath && cacheInfo.tempPath) {
                syncPromises.push(
                    syncTempToFile(articleId, cacheInfo.filePath).catch(err => {
                        console.error(`[Cache] Failed to sync temp file for ${articleId}:`, err);
                    })
                );
            }
        }
        
        // 等待所有同步操作完成
        await Promise.all(syncPromises);
        
        // 清理所有缓存记录
        tempFileCache.clear();
        
        // 清理安装目录下的 tmp 目录中所有遗留的临时文件（防止有未记录的临时文件）
        try {
            if (await fs.pathExists(TEMP_DIR)) {
                const files = await fs.readdir(TEMP_DIR);
                for (const file of files) {
                    if (file.endsWith(TEMP_FILE_SUFFIX)) {
                        const filePath = path.join(TEMP_DIR, file);
                        try {
                            await fs.remove(filePath);
                            console.log(`[Cache] Removed orphaned temp file: ${filePath}`);
                        } catch (err) {
                            console.error(`[Cache] Failed to remove orphaned temp file ${filePath}:`, err);
                        }
                    }
                }
            }
        } catch (err) {
            console.error('[Cache] Failed to cleanup orphaned temp files:', err);
        }
        
        // 清理文档目录中可能遗留的旧格式临时文件（兼容旧版本）
        try {
            const docsDir = paths.docs;
            if (await fs.pathExists(docsDir)) {
                const files = await fs.readdir(docsDir);
                for (const file of files) {
                    if (file.endsWith(TEMP_FILE_SUFFIX)) {
                        const filePath = path.join(docsDir, file);
                        try {
                            await fs.remove(filePath);
                            console.log(`[Cache] Removed old format temp file: ${filePath}`);
                        } catch (err) {
                            console.error(`[Cache] Failed to remove old temp file ${filePath}:`, err);
                        }
                    }
                }
            }
        } catch (err) {
            console.error('[Cache] Failed to cleanup old format temp files:', err);
        }
        
        // 清理系统临时目录中可能遗留的旧版本临时文件（兼容旧版本）
        try {
            const os = require('os');
            const systemTempDir = path.join(os.tmpdir(), 'ymhut-write-cache');
            if (await fs.pathExists(systemTempDir)) {
                const files = await fs.readdir(systemTempDir);
                for (const file of files) {
                    if (file.endsWith(TEMP_FILE_SUFFIX)) {
                        const filePath = path.join(systemTempDir, file);
                        try {
                            await fs.remove(filePath);
                            console.log(`[Cache] Removed old system temp file: ${filePath}`);
                        } catch (err) {
                            console.error(`[Cache] Failed to remove old system temp file ${filePath}:`, err);
                        }
                    }
                }
                // 如果目录为空，尝试删除目录
                try {
                    const remainingFiles = await fs.readdir(systemTempDir);
                    if (remainingFiles.length === 0) {
                        await fs.remove(systemTempDir);
                        console.log(`[Cache] Removed empty old system temp directory: ${systemTempDir}`);
                    }
                } catch (err) {
                    // 忽略删除目录的错误
                }
            }
        } catch (err) {
            console.error('[Cache] Failed to cleanup old system temp files:', err);
        }
        
        console.log('[Cache] Cleaned up all temp files and cache timers');
    } catch (error) {
        console.error('[Cache] Failed to cleanup temp files:', error);
    }
}

/**
 * 清理 tmp 目录中的所有临时文件（应用启动时调用）
 * 用于清理上次异常退出时遗留的临时文件
 */
async function cleanupTempDirOnStartup() {
    try {
        console.log('[Cache] Cleaning up temp directory on startup...');
        if (await fs.pathExists(TEMP_DIR)) {
            const files = await fs.readdir(TEMP_DIR);
            let cleanedCount = 0;
            for (const file of files) {
                if (file.endsWith(TEMP_FILE_SUFFIX)) {
                    const filePath = path.join(TEMP_DIR, file);
                    try {
                        await fs.remove(filePath);
                        cleanedCount++;
                        console.log(`[Cache] Removed startup temp file: ${filePath}`);
                    } catch (err) {
                        console.error(`[Cache] Failed to remove startup temp file ${filePath}:`, err);
                    }
                }
            }
            if (cleanedCount > 0) {
                console.log(`[Cache] Cleaned up ${cleanedCount} temp files on startup`);
            }
        }
    } catch (error) {
        console.error('[Cache] Failed to cleanup temp directory on startup:', error);
    }
}

module.exports = {
    queueWrite,
    saveToTempCache,
    loadFromTempCache,
    syncTempToFile,
    startTempCacheTimer,
    stopTempCacheTimer,
    cleanupAllTempFiles,
    cleanupTempDirOnStartup, // 启动时清理
    getTempFilePath // 导出以便其他地方使用
};