const fs = require('fs-extra');
const path = require('path');

// 写入队列：防止对同一个文件同时发起多次写入导致文件损坏
const writeQueues = new Map();

// 临时文件缓存管理器
const tempFileCache = new Map(); // articleId -> { tempPath, lastSaveTime, timer }
const TEMP_FILE_SUFFIX = '.cache.tmp';
const CACHE_SAVE_INTERVAL = 60000; // 1分钟 = 60000毫秒

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
        const tempPath = filePath + TEMP_FILE_SUFFIX;
        if (await fs.pathExists(tempPath)) {
            const content = await fs.readFile(tempPath, 'utf-8');
            console.log(`[Cache] Loaded from temp file: ${tempPath}`);
            return content;
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
        const tempPath = filePath + TEMP_FILE_SUFFIX;
        
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
    tempFileCache.set(articleId, {
        tempPath: filePath + TEMP_FILE_SUFFIX,
        lastSaveTime: Date.now(),
        timer: null, // 定时器由前端管理，这里不创建
        filePath: filePath
    });
    
    console.log(`[Cache] Registered cache for article: ${articleId}, filePath: ${filePath}`);
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
 */
async function cleanupAllTempFiles() {
    try {
        for (const [articleId, cacheInfo] of tempFileCache.entries()) {
            if (cacheInfo.timer) {
                clearInterval(cacheInfo.timer);
            }
            // 注意：这里不删除临时文件，因为可能还有未保存的内容
            // 临时文件会在下次加载时自动同步
        }
        tempFileCache.clear();
        console.log('[Cache] Cleaned up all temp cache timers');
    } catch (error) {
        console.error('[Cache] Failed to cleanup temp files:', error);
    }
}

module.exports = {
    queueWrite,
    saveToTempCache,
    loadFromTempCache,
    syncTempToFile,
    startTempCacheTimer,
    stopTempCacheTimer,
    cleanupAllTempFiles
};