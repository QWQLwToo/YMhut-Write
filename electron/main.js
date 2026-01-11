const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs-extra');
const ini = require('ini');
const { v4: uuidv4 } = require('uuid');
const mammoth = require('mammoth');
const { Document, Packer, Paragraph, TextRun, HeadingLevel } = require('docx');

// 引入工具模块
const paths = require('./utils/paths');
const { sysDb, docDb, saveSnapshot, queueDocDbOperation } = require('./utils/db');
const { 
    queueWrite, 
    saveToTempCache, 
    loadFromTempCache, 
    syncTempToFile, 
    startTempCacheTimer, 
    stopTempCacheTimer,
    cleanupAllTempFiles,
    cleanupTempDirOnStartup, // 启动时清理临时文件
    getTempFilePath
} = require('./utils/fileManager'); // [新增] 引入并发管理器和临时文件缓存
const { logError, logInfo, readLogs, getAvailableLogDates } = require('./utils/logger'); // 日志模块

let mainWindow;

// --- 辅助函数 ---
function getDocsDir() {
    let docsDir = paths.docs;
    try {
        if (fs.existsSync(paths.config)) {
            const config = ini.parse(fs.readFileSync(paths.config, 'utf-8'));
            const customPath = config.Paths?.docs_dir;
            if (customPath && !customPath.includes('默认') && !customPath.includes('程序目录')) {
                docsDir = customPath;
            }
        }
    } catch (e) {
        console.error('Config read error, using default docs path');
    }
    fs.ensureDirSync(docsDir);
    return docsDir;
}

function checkIsFirstRun() {
    try {
        if (!fs.existsSync(paths.config)) return true;
        const configRaw = fs.readFileSync(paths.config, 'utf-8');
        const config = ini.parse(configRaw);
        return config.General?.setup_complete !== true;
    } catch (e) { return true; }
}

function createWindow() {
    const isFirstRun = checkIsFirstRun();
    const width = isFirstRun ? 800 : 1200;
    const height = isFirstRun ? 600 : 800;

    mainWindow = new BrowserWindow({
        width, height, minWidth: 800, minHeight: 600,
        frame: false, titleBarStyle: 'hidden',
        backgroundColor: '#f5f5f7', // 设置背景色避免闪屏（浅色模式）
        show: false, // 先不显示，等加载完成后再显示
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false, 
            contextIsolation: true, 
            sandbox: false,
            backgroundThrottling: false, // 防止后台时性能降低
            offscreen: false, // 确保渲染在屏幕上
            webSecurity: true,
            // 优化渲染性能，减少闪屏
            enableBlinkFeatures: 'CSSColorSchemeUARendering'
        },
        // 防止窗口状态变化时的闪屏
        paintWhenInitiallyHidden: true, // 允许在隐藏时绘制
        transparent: false, // 确保不透明，避免渲染问题
        hasShadow: true, // 启用阴影
        // 禁用窗口动画，减少闪屏
        useContentSize: true, // 使用内容大小而不是窗口大小
        autoHideMenuBar: true // 自动隐藏菜单栏
    });
    
    console.log('[Electron] Window created, width:', width, 'height:', height);
    
    // 防止窗口状态变化时的闪屏
    let windowShown = false;
    
    mainWindow.once('ready-to-show', () => {
        console.log('[Electron] Window ready to show');
        if (!windowShown && mainWindow && !mainWindow.isDestroyed()) {
            windowShown = true;
            mainWindow.show();
            mainWindow.focus();
        }
    });
    
    // 备用显示机制：如果 ready-to-show 没有触发，在 did-finish-load 后显示
    mainWindow.webContents.once('did-finish-load', () => {
        console.log('[Electron] Page finished loading');
        if (!windowShown && mainWindow && !mainWindow.isDestroyed()) {
            setTimeout(() => {
                if (!windowShown && mainWindow && !mainWindow.isDestroyed()) {
                    console.log('[Electron] Showing window as fallback');
                    windowShown = true;
                    mainWindow.show();
                    mainWindow.focus();
                }
            }, 300);
        }
    });
    
    // 最后的备用机制：如果3秒后窗口还没显示，强制显示
    setTimeout(() => {
        if (!windowShown && mainWindow && !mainWindow.isDestroyed()) {
            console.log('[Electron] Force showing window after timeout');
            windowShown = true;
            mainWindow.show();
            mainWindow.focus();
        }
    }, 3000);
    
    // 防止窗口状态变化时的闪屏
    let isResizing = false;
    let isMaximizing = false;
    let resizeStartTime = 0;
    
    // 在resize之前暂停渲染，避免闪屏（Windows/Linux支持）
    if (process.platform !== 'darwin') {
        mainWindow.on('will-resize', (event, newBounds) => {
            if (!isResizing && !isMaximizing) {
                isResizing = true;
                resizeStartTime = Date.now();
                // 暂时禁用重绘
                mainWindow.webContents.setFrameRate(0);
                // 通知前端暂停CSS过渡
                mainWindow.webContents.send('window-resizing-start');
                // 执行JavaScript来强制禁用CSS过渡
                mainWindow.webContents.executeJavaScript(`
                    document.documentElement.classList.add('no-transitions');
                `).catch(() => {});
            }
        });
        
        // 在move之前暂停渲染
        mainWindow.on('will-move', (event, newBounds) => {
            if (!isResizing && !isMaximizing) {
                isResizing = true;
                resizeStartTime = Date.now();
                mainWindow.webContents.setFrameRate(0);
                mainWindow.webContents.send('window-resizing-start');
                mainWindow.webContents.executeJavaScript(`
                    document.documentElement.classList.add('no-transitions');
                `).catch(() => {});
            }
        });
    }
    
    // 监听窗口最大化/还原事件，防止闪屏
    mainWindow.on('maximize', () => {
        // 不要立即恢复帧率，等待 resize 事件完成后再恢复
        // 延迟发送消息，避免闪屏
        setTimeout(() => {
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('window-maximized');
            }
        }, 100);
    });
    
    mainWindow.on('unmaximize', () => {
        // 不要立即恢复帧率，等待 resize 事件完成后再恢复
        setTimeout(() => {
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('window-unmaximized');
            }
        }, 100);
    });
    
    // 监听窗口大小变化，防止闪屏
    let resizeTimer = null;
    let lastResizeTime = 0;
    let resizeCount = 0;
    mainWindow.on('resize', () => {
        // 恢复渲染（延迟恢复，确保resize完成）
        if (resizeTimer) clearTimeout(resizeTimer);
        
        resizeCount++;
        lastResizeTime = Date.now();
        
        // 如果正在最大化/还原，延迟更久，确保窗口状态变化完全完成
        // 最大化/还原通常会有多次resize事件，需要等待所有事件完成
        const delay = isMaximizing ? 400 : 200;
        
        resizeTimer = setTimeout(() => {
            // 检查是否在延迟期间又有新的resize事件
            const timeSinceLastResize = Date.now() - lastResizeTime;
            const currentResizeCount = resizeCount;
            
            // 如果最近有resize事件，再延迟一点
            if (timeSinceLastResize < 100) {
                setTimeout(() => {
                    // 再次检查是否还有新的resize事件
                    if (Date.now() - lastResizeTime >= 100 && currentResizeCount === resizeCount) {
                        if (mainWindow && !mainWindow.isDestroyed() && mainWindow.isVisible()) {
                            // 恢复渲染
                            mainWindow.webContents.setFrameRate(60);
                            isResizing = false;
                            isMaximizing = false;
                            resizeCount = 0;
                            
                            // 通知前端恢复CSS过渡
                            mainWindow.webContents.send('window-resizing-end');
                            
                            // 执行JavaScript来恢复CSS过渡
                            mainWindow.webContents.executeJavaScript(`
                                setTimeout(() => {
                                    document.documentElement.classList.remove('no-transitions');
                                }, 50);
                            `).catch(() => {});
                        }
                    }
                }, 150);
            } else {
                if (mainWindow && !mainWindow.isDestroyed() && mainWindow.isVisible()) {
                    // 恢复渲染
                    mainWindow.webContents.setFrameRate(60);
                    isResizing = false;
                    isMaximizing = false;
                    resizeCount = 0;
                    
                    // 通知前端恢复CSS过渡
                    mainWindow.webContents.send('window-resizing-end');
                    
                    // 执行JavaScript来恢复CSS过渡
                    mainWindow.webContents.executeJavaScript(`
                        setTimeout(() => {
                            document.documentElement.classList.remove('no-transitions');
                        }, 50);
                    `).catch(() => {});
                }
            }
        }, delay);
    });
    
    // 监听窗口移动，防止闪屏
    let moveTimer = null;
    mainWindow.on('move', () => {
        // 恢复渲染
        if (isResizing) {
            isResizing = false;
        }
        if (mainWindow.isVisible()) {
            mainWindow.webContents.setFrameRate(60);
        }
        if (moveTimer) clearTimeout(moveTimer);
        moveTimer = setTimeout(() => {
            if (mainWindow && !mainWindow.isDestroyed() && mainWindow.isVisible()) {
                mainWindow.webContents.setFrameRate(60);
            }
        }, 150);
    });
    
    // 监听窗口最小化/恢复
    mainWindow.on('minimize', () => {
        // 最小化时降低帧率节省资源
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.setFrameRate(30);
        }
    });
    
    mainWindow.on('restore', () => {
        // 恢复时提高帧率
        if (mainWindow && !mainWindow.isDestroyed() && mainWindow.isVisible()) {
            mainWindow.webContents.setFrameRate(60);
        }
    });

    const route = isFirstRun ? '#/setup' : '#/workspace';
    
    // 加载URL
    if (process.env.VITE_DEV_SERVER_URL) {
        const url = `${process.env.VITE_DEV_SERVER_URL}${route}`;
        console.log('[Electron] Loading URL:', url);
        mainWindow.loadURL(url).catch(err => {
            console.error('[Electron] Failed to load URL:', err);
        });
    } else {
        const indexHtml = path.join(__dirname, '../dist/index.html');
        console.log('[Electron] Loading file:', indexHtml);
        mainWindow.loadFile(indexHtml).then(() => {
            // 加载文件后导航到路由
            mainWindow.webContents.executeJavaScript(`window.location.hash = '${route}'`);
        }).catch(err => {
            console.error('[Electron] Failed to load file:', err);
        });
    }
    
    // 监听页面加载完成事件
    mainWindow.webContents.once('did-finish-load', () => {
        console.log('[Electron] Page loaded successfully');
        // 设置初始帧率
        mainWindow.webContents.setFrameRate(60);
        // 禁用缩放，避免闪屏
        mainWindow.webContents.setVisualZoomLevelLimits(1, 1);
        // 确保缩放因子为1
        mainWindow.webContents.setZoomFactor(1);
        // 确保窗口显示
        if (mainWindow && !mainWindow.isDestroyed() && !mainWindow.isVisible()) {
            mainWindow.show();
            mainWindow.focus();
        }
    });
    
    // 监听加载错误
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
        console.error('[Electron] Failed to load:', errorCode, errorDescription, validatedURL);
        // 即使加载失败也显示窗口，让用户看到错误
        if (mainWindow && !mainWindow.isDestroyed() && !mainWindow.isVisible()) {
            mainWindow.show();
        }
    });

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });
    
    // 开发模式下打开开发者工具（可选）
    if (process.env.VITE_DEV_SERVER_URL) {
        // mainWindow.webContents.openDevTools();
    }
}

// --- IPC 通信 ---

ipcMain.on('window-min', () => mainWindow?.minimize());
ipcMain.on('window-close', () => mainWindow?.close());
ipcMain.on('window-max', () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    
    // 设置标志，表示正在最大化/还原
    isMaximizing = true;
    
    // 在最大化/还原之前暂停渲染，避免闪屏
    mainWindow.webContents.setFrameRate(0);
    
    // 通知前端立即禁用所有过渡和动画
    mainWindow.webContents.send('window-resizing-start');
    
    // 执行JavaScript来强制禁用CSS过渡（更可靠）
    mainWindow.webContents.executeJavaScript(`
        (function() {
            const root = document.documentElement;
            root.classList.add('no-transitions');
            // 强制重排，确保样式立即生效
            void root.offsetHeight;
        })();
    `).catch(() => {});
    
    // 使用更短的延迟，确保暂停渲染生效
    // 但不要立即执行，给渲染暂停一些时间
    setTimeout(() => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            // 直接执行最大化/还原操作
            if (mainWindow.isMaximized()) {
                mainWindow.unmaximize();
            } else {
                mainWindow.maximize();
            }
        }
    }, 20);
    
    // 注意：不在这里恢复渲染，让 resize 事件处理器来恢复
    // 这样可以确保窗口大小变化完全完成后再恢复渲染
});

ipcMain.handle('select-directory', async () => {
    const result = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory', 'createDirectory'] });
    return result.canceled ? null : result.filePaths[0];
});

// 打开外部文件
ipcMain.handle('open-external-file', async () => {
    try {
        const result = await dialog.showOpenDialog(mainWindow, {
            title: '打开文档',
            filters: [
                { name: '所有支持的格式', extensions: ['txt', 'md', 'markdown', 'doc', 'docx', 'rtf'] },
                { name: '文本文件', extensions: ['txt'] },
                { name: 'Markdown', extensions: ['md', 'markdown'] },
                { name: 'Word文档', extensions: ['doc', 'docx'] },
                { name: 'RTF文档', extensions: ['rtf'] },
                { name: '所有文件', extensions: ['*'] }
            ],
            properties: ['openFile']
        });
        
        if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
            return { success: false, canceled: true };
        }
        
        const filePath = result.filePaths[0];
        const ext = path.extname(filePath).toLowerCase();
        const fileName = path.basename(filePath, ext);
        
        // 读取文件内容
        let content = '';
        let format = 'txt';
        
        if (['.txt', '.md', '.markdown'].includes(ext)) {
            // 文本文件直接读取
            content = fs.readFileSync(filePath, 'utf-8');
            format = ext === '.md' || ext === '.markdown' ? 'md' : 'txt';
        } else if (ext === '.docx') {
            // Word文档（.docx）：使用 mammoth 转换为 HTML，支持图片
            try {
                const result = await mammoth.convertToHtml(
                    { path: filePath },
                    { 
                        convertImage: mammoth.images.inline() // 将图片转换为base64嵌入HTML
                    }
                );
                content = result.value; // HTML 内容（包含base64图片）
                format = 'txt'; // 使用富文本编辑器格式（contenteditable）
                
                // 如果有警告，记录但不阻止
                if (result.messages && result.messages.length > 0) {
                    console.warn('Word文档转换警告:', result.messages);
                }
            } catch (e) {
                logError('Word文档转换失败', e);
                return {
                    success: false,
                    error: 'Word文档解析失败: ' + (e.message || '未知错误')
                };
            }
        } else if (ext === '.doc') {
            // 旧版 Word 文档（.doc）：提示用户转换为 .docx
            return { 
                success: false, 
                error: '不支持旧版 Word 文档（.doc）格式。请先将文档另存为 .docx 格式，或转换为 TXT/MD 格式。' 
            };
        } else if (ext === '.rtf') {
            // RTF文档：简单处理，提取文本
            // RTF是文本格式，但包含格式标记，这里简单提取纯文本
            const rtfContent = fs.readFileSync(filePath, 'utf-8');
            // 简单的RTF到纯文本转换（移除RTF标记）
            content = rtfContent
                .replace(/\\[a-z]+\d*\s?/gi, '') // 移除RTF命令
                .replace(/\{[^}]*\}/g, '') // 移除花括号内容
                .replace(/\\[{}]/g, '') // 移除转义字符
                .trim();
            format = 'txt';
        } else {
            // 其他格式，尝试作为文本读取
            try {
                content = fs.readFileSync(filePath, 'utf-8');
                format = 'txt';
            } catch (e) {
                return { success: false, error: '不支持的文件格式' };
            }
        }
        
        // 创建新文章
        const articleId = uuidv4();
        const docsDir = getDocsDir();
        const newFilePath = path.join(docsDir, `${articleId}${format === 'md' ? '.md' : '.txt'}`);
        
        // 写入文件
        await queueWrite(newFilePath, content);
        
        // 添加到数据库
        const insertStmt = docDb.prepare(`
            INSERT INTO articles (id, title, path, format, created_at, updated_at)
            VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
        `);
        
        await queueDocDbOperation(() => {
            insertStmt.run(articleId, fileName, newFilePath, format);
        });
        
        return { 
            success: true, 
            articleId: articleId,
            title: fileName,
            format: format
        };
    } catch (e) {
        logError('打开外部文件失败', e);
        return { success: false, error: e.message || '打开文件失败' };
    }
});

ipcMain.handle('complete-setup', async (event, data) => {
    try {
        const finalDocPath = (data.docPath && !data.docPath.includes('默认')) ? data.docPath : paths.docs;
        const finalDbPath = (data.dbPath && !data.dbPath.includes('默认')) ? data.dbPath : paths.data;

        const configContent = {
            General: { setup_complete: true, auto_start: data.autoStart, default_format: data.defaultFormat },
            Paths: { docs_dir: finalDocPath, db_dir: finalDbPath },
            Appearance: { 
                theme: 'light', 
                language: data.language || 'zh-CN', 
                font_family: '', 
                font_size: '18', 
                show_raw_md: false 
            }
        };

        fs.ensureDirSync(path.dirname(paths.config));
        fs.writeFileSync(paths.config, ini.stringify(configContent));

        if (process.platform === 'win32') {
            app.setLoginItemSettings({ openAtLogin: data.autoStart, path: process.execPath });
        }

        mainWindow.setSize(1200, 800);
        mainWindow.center();
        const targetUrl = process.env.VITE_DEV_SERVER_URL 
            ? `${process.env.VITE_DEV_SERVER_URL}#/workspace`
            : `file://${path.join(__dirname, '../dist/index.html')}#/workspace`;
        mainWindow.loadURL(targetUrl);
        return { success: true };
    } catch (error) { return { success: false, error: error.message }; }
});

ipcMain.handle('get-system-fonts', () => [
    { name: '系统默认 (Sans)', value: '-apple-system, BlinkMacSystemFont, "Microsoft YaHei", "Segoe UI", sans-serif' },
    { name: '宋体 (Serif)', value: '"Songti SC", "SimSun", "Georgia", serif' },
    { name: '黑体 (Heiti)', value: '"PingFang SC", "Heiti SC", "Microsoft YaHei", sans-serif' },
    { name: '楷体 (Kaiti)', value: '"KaiTi", "STKaiti", "BiauKai", serif' },
    { name: '代码 (Mono)', value: '"Consolas", "Courier New", monospace' }
]);

ipcMain.handle('save-settings', (event, settings) => {
    try {
        const configRaw = fs.existsSync(paths.config) ? fs.readFileSync(paths.config, 'utf-8') : '';
        const config = ini.parse(configRaw);
        if (!config.Appearance) config.Appearance = {};
        
        const safeSettings = { ...settings };
        // 转换驼峰命名到下划线命名
        if (typeof safeSettings.showRawMd === 'boolean') {
            safeSettings.show_raw_md = safeSettings.showRawMd;
            delete safeSettings.showRawMd;
        }
        if (typeof safeSettings.autoSave === 'boolean') {
            safeSettings.auto_save = safeSettings.autoSave;
            delete safeSettings.autoSave;
        }
        if (typeof safeSettings.showLineNumbers === 'boolean') {
            safeSettings.show_line_numbers = safeSettings.showLineNumbers;
            delete safeSettings.showLineNumbers;
        }
        if (typeof safeSettings.outlineMode === 'boolean') {
            safeSettings.outline_mode = safeSettings.outlineMode;
            delete safeSettings.outlineMode;
        }
        if (typeof safeSettings.typewriterMode === 'boolean') {
            safeSettings.typewriter_mode = safeSettings.typewriterMode;
            delete safeSettings.typewriterMode;
        }
        if (typeof safeSettings.focusMode === 'boolean') {
            safeSettings.focus_mode = safeSettings.focusMode;
            delete safeSettings.focusMode;
        }
        if (typeof safeSettings.sourceMode === 'boolean') {
            safeSettings.source_mode = safeSettings.sourceMode;
            delete safeSettings.sourceMode;
        }

        Object.assign(config.Appearance, safeSettings);
        fs.writeFileSync(paths.config, ini.stringify(config));
        mainWindow.webContents.send('settings-updated', settings);
        return true;
    } catch (e) { return false; }
});

ipcMain.handle('get-settings', () => {
    try {
        if (!fs.existsSync(paths.config)) return {};
        const config = ini.parse(fs.readFileSync(paths.config, 'utf-8'));
        return {
            theme: config.Appearance?.theme || 'light',
            language: config.Appearance?.language || 'zh-CN',
            fontFamily: config.Appearance?.font_family || '',
            fontSize: config.Appearance?.font_size || '18',
            showRawMd: config.Appearance?.show_raw_md === true || config.Appearance?.show_raw_md === 'true',
            autoSave: config.Appearance?.auto_save !== 'false',
            showLineNumbers: config.Appearance?.show_line_numbers === true || config.Appearance?.show_line_numbers === 'true',
            outlineMode: config.Appearance?.outline_mode === true || config.Appearance?.outline_mode === 'true',
            typewriterMode: config.Appearance?.typewriter_mode === true || config.Appearance?.typewriter_mode === 'true',
            focusMode: config.Appearance?.focus_mode === true || config.Appearance?.focus_mode === 'true',
            sourceMode: config.Appearance?.source_mode === true || config.Appearance?.source_mode === 'true'
        };
    } catch (e) { return {}; }
});

ipcMain.handle('get-default-format', () => {
    try {
        if (!fs.existsSync(paths.config)) return 'md';
        const config = ini.parse(fs.readFileSync(paths.config, 'utf-8'));
        return config.General?.default_format || 'md';
    } catch (e) { return 'md'; }
});

ipcMain.handle('get-app-version', () => {
    try {
        const packageJson = require('../package.json');
        return packageJson.version || '1.0.0';
    } catch (e) {
        return app.getVersion() || '1.0.0';
    }
});

ipcMain.handle('open-external', (event, url) => {
    shell.openExternal(url);
    return true;
});

// --- 文章管理 ---

ipcMain.handle('get-articles', async () => {
    try {
        // 读取操作也使用队列，确保一致性
        return await queueDocDbOperation(() => {
            const stmt = docDb.prepare('SELECT id, title, format, updated_at, path FROM articles ORDER BY updated_at DESC');
            return stmt.all();
        });
    } catch (e) { return []; }
});

ipcMain.handle('create-article', async (event, { title, format }) => {
    try {
        const id = uuidv4();
        const now = new Date();
        const docsDir = getDocsDir();

        // 如果没有提供标题，使用默认命名：默认文档+创建时间
        let finalTitle = title;
        if (!finalTitle || finalTitle.trim() === '') {
            const timeStr = now.toISOString().replace(/[:.]/g, '-').slice(0, -5); // 格式：2024-01-01T12-00-00
            finalTitle = `默认文档 ${timeStr}`;
        }

        const safeTitle = finalTitle.replace(/[\\/:*?"<>|]/g, '_');
        const fileName = `${safeTitle}.${format}`;
        const filePath = path.join(docsDir, fileName);

        // [升级] 使用队列异步写入初始文件
        await queueWrite(filePath, ''); 
        
        const nowISO = now.toISOString();
        // 使用队列化数据库操作
        await queueDocDbOperation(() => {
            const insert = docDb.prepare('INSERT INTO articles (id, title, path, format, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)');
            insert.run(id, safeTitle, filePath, format, nowISO, nowISO);
        });
        
        // 清理可能存在的旧临时文件（兼容旧版本）
        const oldTempPath = filePath + '.cache.tmp';
        if (fs.existsSync(oldTempPath)) {
            await fs.remove(oldTempPath);
        }
        // 清理系统临时目录中可能存在的临时文件
        const systemTempPath = getTempFilePath(filePath);
        if (fs.existsSync(systemTempPath)) {
            await fs.remove(systemTempPath);
        }

        return { id, title: safeTitle, format, updated_at: nowISO };
    } catch (e) {
        logError('创建文章失败', e);
        throw e; // 重新抛出以便前端处理
    }
});

ipcMain.handle('get-article-content', async (event, id) => {
    try {
        const article = await queueDocDbOperation(() => {
            const stmt = docDb.prepare('SELECT path FROM articles WHERE id = ?');
            return stmt.get(id);
        });
        
        if (!article || !article.path) return '';
        // 读取保持同步即可，读取通常不会锁死
        if (fs.existsSync(article.path)) {
            return fs.readFileSync(article.path, 'utf-8');
        }
        return '';
    } catch (e) { return ''; }
});

// [核心升级] 异步保存 + 队列机制 + 临时文件缓存
ipcMain.handle('save-article', async (event, { id, content, title, isFinalSave = false }) => {
    try {
        // 先读取文章信息（读取操作可以并发，但为了安全也使用队列）
        const article = await queueDocDbOperation(() => {
            const stmt = docDb.prepare('SELECT path, title, format FROM articles WHERE id = ?');
            return stmt.get(id);
        });
        
        if (article && article.path) {
            if (isFinalSave) {
                // 最终保存：同步临时文件到正式文件，然后删除临时文件
                const hasTempFile = await syncTempToFile(id, article.path);
                
                // 如果没有临时文件，直接保存内容
                if (!hasTempFile) {
                    await queueWrite(article.path, content);
                }
                
                // 使用队列化数据库操作，避免锁死
                await queueDocDbOperation(() => {
                    // 如果提供了 title 且与当前不同，更新标题
                    if (title !== undefined && title !== null && title !== article.title) {
                        docDb.prepare('UPDATE articles SET title = ? WHERE id = ?').run(title, id);
                    }

                    const now = new Date().toISOString();
                    docDb.prepare('UPDATE articles SET updated_at = ? WHERE id = ?').run(now, id);
                });
                
                // 异步保存快照，不阻塞主流程
                const finalContent = hasTempFile ? await loadFromTempCache(article.path) || content : content;
                saveSnapshot(id, finalContent).catch(err => {
                    console.error('Snapshot save failed:', err);
                });
            } else {
                // 临时保存：只保存到临时文件缓存（快速，不阻塞）
                await saveToTempCache(id, article.path, content);
            }
            
            return true;
        }
        return false;
    } catch (e) {
        logError('保存文章失败', e);
        return false;
    }
});

// 启动文章编辑的临时文件缓存定时器
ipcMain.handle('start-article-cache', async (event, { id, filePath }) => {
    try {
        // 停止旧的定时器（如果存在）
        stopTempCacheTimer(id);
        
        // 启动新的定时器
        // 注意：定时器会在 fileManager 中管理，实际内容由前端的 save-article 提供
        startTempCacheTimer(id, filePath, () => {
            // 这个函数会在定时器触发时被调用
            // 但实际内容由前端通过 save-article 提供，所以这里返回空字符串
            // 定时器主要用于标记，实际保存由前端触发
            return '';
        });
        
        console.log(`[Cache] Started cache timer for article: ${id}`);
        return true;
    } catch (e) {
        console.error('Start cache error:', e);
        return false;
    }
});

// 停止文章编辑的临时文件缓存定时器
ipcMain.handle('stop-article-cache', async (event, { id, filePath }) => {
    try {
        // 同步临时文件到正式文件
        await syncTempToFile(id, filePath);
        stopTempCacheTimer(id);
        return true;
    } catch (e) {
        console.error('Stop cache error:', e);
        return false;
    }
});

ipcMain.handle('delete-article', async (event, { id, deleteFile = true }) => {
    try {
        const article = await queueDocDbOperation(() => {
            const stmt = docDb.prepare('SELECT path FROM articles WHERE id = ?');
            return stmt.get(id);
        });
        
        if (article) {
            // 如果选择删除文件，则删除物理文件
            if (deleteFile && article.path && fs.existsSync(article.path)) {
                try {
                    fs.unlinkSync(article.path); // 删除可以用同步，因为不会频繁触发
                } catch (e) {
                    console.error('Failed to delete file:', e);
                    // 即使文件删除失败，也继续删除数据库记录
                }
            }
            
            // 删除数据库记录（包括快照）
            await queueDocDbOperation(() => {
                docDb.prepare('DELETE FROM article_snapshots WHERE article_id = ?').run(id);
                docDb.prepare('DELETE FROM articles WHERE id = ?').run(id);
            });
            
            return true;
        }
        return false;
    } catch (e) {
        logError('删除文章失败', e);
        return false;
    }
});

// 导出文章
ipcMain.handle('export-article', async (event, { articleId, format }) => {
    try {
        // 获取文章信息
        const article = await queueDocDbOperation(() => {
            const stmt = docDb.prepare('SELECT title, path, format FROM articles WHERE id = ?');
            return stmt.get(articleId);
        });
        
        if (!article || !article.path || !fs.existsSync(article.path)) {
            return { success: false, error: '文章不存在' };
        }
        
        // 读取文章内容
        let content = fs.readFileSync(article.path, 'utf-8');
        
        // 如果是富文本格式（HTML），需要提取纯文本
        if (article.format === 'txt' && content.trim().startsWith('<')) {
            // HTML内容，提取纯文本（简单方法，不使用cheerio）
            content = content
                .replace(/<[^>]+>/g, '') // 移除所有HTML标签
                .replace(/&nbsp;/g, ' ') // 替换&nbsp;
                .replace(/&amp;/g, '&') // 替换&amp;
                .replace(/&lt;/g, '<') // 替换&lt;
                .replace(/&gt;/g, '>') // 替换&gt;
                .replace(/&quot;/g, '"') // 替换&quot;
                .replace(/&#39;/g, "'") // 替换&#39;
                .replace(/\n\s*\n/g, '\n') // 移除多余空行
                .trim();
        }
        
        // 准备导出内容
        let exportContent = '';
        let defaultPath = '';
        let filters = [];
        
        if (format === 'txt') {
            // 导出为TXT：纯文本内容
            // 如果是Markdown，移除Markdown语法
            if (article.format === 'md') {
                exportContent = content
                    .replace(/^#{1,6}\s+/gm, '') // 移除标题标记
                    .replace(/\*\*(.*?)\*\*/g, '$1') // 移除粗体
                    .replace(/\*(.*?)\*/g, '$1') // 移除斜体
                    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // 移除链接，保留文本
                    .replace(/`([^`]+)`/g, '$1') // 移除行内代码
                    .replace(/```[\s\S]*?```/g, '') // 移除代码块
                    .replace(/^[-*+]\s+/gm, '') // 移除列表标记
                    .replace(/^\d+\.\s+/gm, '') // 移除有序列表标记
                    .replace(/^>\s+/gm, '') // 移除引用标记
                    .trim();
            } else {
                exportContent = content;
            }
            defaultPath = `${article.title || '未命名文档'}.txt`;
            filters = [{ name: 'Text Files', extensions: ['txt'] }];
        } else if (format === 'json') {
            // 导出为JSON：包含元数据和内容
            const jsonData = {
                title: article.title,
                format: article.format,
                content: content,
                body: content, // 同时提供body字段以兼容旧格式
                exportedAt: new Date().toISOString()
            };
            exportContent = JSON.stringify(jsonData, null, 2);
            defaultPath = `${article.title || '未命名文档'}.json`;
            filters = [{ name: 'JSON Files', extensions: ['json'] }];
        } else if (format === 'docx') {
            // 导出为Word文档（.docx）
            // 提取纯文本内容用于Word文档
            let plainText = content;
            if (article.format === 'txt' && content.trim().startsWith('<')) {
                // HTML内容，提取纯文本
                plainText = content
                    .replace(/<[^>]+>/g, '') // 移除所有HTML标签
                    .replace(/&nbsp;/g, ' ')
                    .replace(/&amp;/g, '&')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, "'")
                    .replace(/\n\s*\n/g, '\n')
                    .trim();
            } else if (article.format === 'md') {
                // Markdown内容，移除Markdown语法
                plainText = content
                    .replace(/^#{1,6}\s+/gm, '')
                    .replace(/\*\*(.*?)\*\*/g, '$1')
                    .replace(/\*(.*?)\*/g, '$1')
                    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
                    .replace(/`([^`]+)`/g, '$1')
                    .replace(/```[\s\S]*?```/g, '')
                    .replace(/^[-*+]\s+/gm, '')
                    .replace(/^\d+\.\s+/gm, '')
                    .replace(/^>\s+/gm, '')
                    .trim();
            }
            
            // 将文本按段落分割（空行分隔）
            const textBlocks = plainText.split(/\n\s*\n/).filter(p => p.trim().length > 0);
            
            // 如果没有段落，使用整个文本
            if (textBlocks.length === 0) {
                textBlocks.push(plainText || '空文档');
            }
            
            // 创建Word文档段落数组
            const paragraphs = [];
            
            // 为每个文本块创建段落
            textBlocks.forEach(block => {
                const lines = block.split('\n').filter(line => line.trim().length > 0);
                
                lines.forEach((line, index) => {
                    // 检测是否是标题（第一行且较短，没有标点）
                    if (index === 0 && lines.length === 1 && line.length < 50 && !line.match(/[。，、；：]/)) {
                        paragraphs.push(
                            new Paragraph({
                                text: line.trim(),
                                heading: HeadingLevel.HEADING_1
                            })
                        );
                    } else {
                        // 普通段落
                        paragraphs.push(
                            new Paragraph({
                                children: [new TextRun(line.trim())]
                            })
                        );
                    }
                });
            });
            
            // 创建Word文档（使用sections结构）
            const doc = new Document({
                creator: 'YMhut-Write',
                title: article.title || '未命名文档',
                description: '由 YMhut-Write 导出',
                sections: [{
                    properties: {},
                    children: paragraphs
                }]
            });
            
            defaultPath = `${article.title || '未命名文档'}.docx`;
            filters = [{ name: 'Word Documents', extensions: ['docx'] }];
            
            // 显示保存对话框
            const result = await dialog.showSaveDialog(mainWindow, {
                title: '导出为 Word 文档',
                defaultPath: defaultPath,
                filters: filters
            });
            
            if (result.canceled || !result.filePath) {
                return { success: false, canceled: true };
            }
            
            // 生成Word文档并写入
            const buffer = await Packer.toBuffer(doc);
            fs.writeFileSync(result.filePath, buffer);
            
            return { success: true, path: result.filePath };
        } else {
            return { success: false, error: '不支持的导出格式' };
        }
        
        // 显示保存对话框（TXT和JSON格式）
        const result = await dialog.showSaveDialog(mainWindow, {
            title: `导出为 ${format.toUpperCase()}`,
            defaultPath: defaultPath,
            filters: filters
        });
        
        if (result.canceled || !result.filePath) {
            return { success: false, canceled: true };
        }
        
        // 写入文件
        await queueWrite(result.filePath, exportContent);
        
        return { success: true, path: result.filePath };
    } catch (e) {
        logError('导出文章失败', e);
        return { success: false, error: e.message };
    }
});

ipcMain.handle('convert-format', async (event, { articleId, targetFormat }) => {
    try {
        const article = await queueDocDbOperation(() => {
            const metaStmt = docDb.prepare('SELECT title, path, format FROM articles WHERE id = ?');
            return metaStmt.get(articleId);
        });
        
        if (!article || !fs.existsSync(article.path)) throw new Error('源文件不存在');

        // 如果目标格式和当前格式相同，直接返回
        if (article.format === targetFormat) {
            return { success: true, newId: articleId, message: '格式相同，无需转换' };
        }

        const rawContent = fs.readFileSync(article.path, 'utf-8');
        let finalContent = rawContent;

        // 处理格式转换
        if (targetFormat === 'json') {
            // 转换为 JSON（同时提供content和body字段以保持兼容）
            finalContent = JSON.stringify({ 
                title: article.title, 
                format: article.format,
                createAt: new Date().toISOString(), 
                content: rawContent,
                body: rawContent 
            }, null, 2);
        } else if (article.format === 'json') {
            // 从 JSON 转换出来
            try {
                const parsed = JSON.parse(rawContent);
                // 支持多种JSON格式：body、content、或者直接是字符串内容
                if (parsed.body) {
                    finalContent = parsed.body;
                } else if (parsed.content) {
                    finalContent = parsed.content;
                } else if (typeof parsed === 'string') {
                    finalContent = parsed;
                } else {
                    // 如果都没有，尝试提取所有文本内容
                    finalContent = JSON.stringify(parsed, null, 2);
                }
            } catch (e) { 
                console.error('JSON parse error:', e);
                finalContent = rawContent; 
            }
        } else if (article.format === 'md' && targetFormat === 'txt') {
            // MD 转 TXT：移除 Markdown 语法，保留纯文本
            finalContent = rawContent
                .replace(/^#{1,6}\s+/gm, '') // 移除标题标记
                .replace(/\*\*(.*?)\*\*/g, '$1') // 移除粗体
                .replace(/\*(.*?)\*/g, '$1') // 移除斜体
                .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // 移除链接，保留文本
                .replace(/`([^`]+)`/g, '$1') // 移除行内代码
                .replace(/```[\s\S]*?```/g, '') // 移除代码块
                .replace(/^[-*+]\s+/gm, '') // 移除列表标记
                .replace(/^\d+\.\s+/gm, '') // 移除有序列表标记
                .replace(/^>\s+/gm, '') // 移除引用标记
                .trim();
        } else if (article.format === 'txt' && targetFormat === 'md') {
            // TXT 转 MD：保持原样，因为 TXT 内容可以直接作为 MD 使用
            finalContent = rawContent;
        }

        // 创建新文档（不替换原文档）
        const id = uuidv4();
        const now = new Date().toISOString();
        const docsDir = getDocsDir();
        const safeTitle = `${article.title}_${targetFormat.toUpperCase()}`.replace(/[\\/:*?"<>|]/g, '_');
        const newPath = path.join(docsDir, `${safeTitle}.${targetFormat}`);
        
        // 确保文件名唯一
        let counter = 1;
        let finalPath = newPath;
        while (fs.existsSync(finalPath)) {
            finalPath = path.join(docsDir, `${safeTitle}_${counter}.${targetFormat}`);
            counter++;
        }
        
        // 队列写入新文件
        await queueWrite(finalPath, finalContent);

        // 创建新的数据库记录（不更新原记录）
        await queueDocDbOperation(() => {
            const insert = docDb.prepare('INSERT INTO articles (id, title, path, format, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)');
            insert.run(id, path.basename(finalPath, path.extname(finalPath)), finalPath, targetFormat, now, now);
        });
        
        return { success: true, newId: id, message: '转换成功，已另存为新文档' };
    } catch (e) {
        logError('格式转换失败', e);
        return { success: false, error: e.message };
    }
});

ipcMain.handle('get-snapshots', async (event, articleId) => {
    try {
        return await queueDocDbOperation(() => {
            const stmt = docDb.prepare('SELECT id, snapshot_time, content FROM article_snapshots WHERE article_id = ? ORDER BY snapshot_time DESC');
            return stmt.all(articleId);
        });
    } catch (e) { return []; }
});

ipcMain.handle('restore-snapshot', async (event, { articleId, content }) => {
    try {
        const article = await queueDocDbOperation(() => {
            const stmt = docDb.prepare('SELECT path FROM articles WHERE id = ?');
            return stmt.get(articleId);
        });
        
        if (article && article.path) {
            // [升级] 队列写入
            queueWrite(article.path, content).catch(err => {
                console.error('Restore snapshot write failed:', err);
            }); // 不await，让它后台写
            
            await queueDocDbOperation(() => {
                const now = new Date().toISOString();
                docDb.prepare('UPDATE articles SET updated_at = ? WHERE id = ?').run(now, articleId);
            });
            
            return true;
        }
        return false;
    } catch (e) { return false; }
});
ipcMain.handle('rename-article', async (event, { id, newTitle }) => {
    try {
        // 1. 获取旧信息 - 使用队列化操作
        const article = await queueDocDbOperation(() => {
            const stmt = docDb.prepare('SELECT path, format FROM articles WHERE id = ?');
            return stmt.get(id);
        });
        
        if (!article || !article.path) throw new Error('文件不存在');

        // 2. 构建新路径
        const dir = path.dirname(article.path);
        const safeTitle = newTitle.replace(/[\\/:*?"<>|]/g, '_'); // 清洗非法字符
        const newFilename = `${safeTitle}.${article.format}`;
        const newPath = path.join(dir, newFilename);

        // 3. 检查重名 (如果新名字的文件已存在，且不是同一个文件)
        if (fs.existsSync(newPath) && newPath !== article.path) {
            throw new Error('该文件名已存在');
        }

        // 4. 物理重命名
        if (fs.existsSync(article.path)) {
            fs.renameSync(article.path, newPath);
        }

        // 5. 更新数据库 (UUID 不变，更新 path 和 title) - 使用队列化操作
        await queueDocDbOperation(() => {
            const now = new Date().toISOString();
            const update = docDb.prepare('UPDATE articles SET title = ?, path = ?, updated_at = ? WHERE id = ?');
            update.run(safeTitle, newPath, now, id);
        });

        return { success: true, newPath, newTitle: safeTitle };
    } catch (e) {
        logError('重命名文章失败', e);
        return { success: false, error: e.message };
    }
});

// 运行日志相关IPC
ipcMain.handle('get-logs', async (event, date = null) => {
    try {
        return readLogs(date);
    } catch (e) {
        logError('读取日志失败', e);
        return [];
    }
});

ipcMain.handle('get-available-log-dates', async () => {
    try {
        return getAvailableLogDates();
    } catch (e) {
        logError('获取日志日期列表失败', e);
        return [];
    }
});

// 捕获渲染进程的错误
ipcMain.handle('log-renderer-error', async (event, { message, stack, source, lineno, colno }) => {
    try {
        const error = new Error(message);
        error.stack = stack || `${source}:${lineno}:${colno}`;
        logError(`渲染进程错误: ${message}`, error);
        return true;
    } catch (e) {
        console.error('Failed to log renderer error:', e);
        return false;
    }
});


app.whenReady().then(async () => {
    console.log('[Electron] App ready, creating window...');
    // 应用启动时清理临时文件目录（清理上次异常退出时遗留的文件）
    await cleanupTempDirOnStartup();
    createWindow();
}).catch(err => {
    console.error('[Electron] Error in app.whenReady():', err);
});

app.on('activate', () => {
    console.log('[Electron] App activated');
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

app.on('window-all-closed', async () => {
    console.log('[Electron] All windows closed');
    // 清理所有临时文件缓存
    await cleanupAllTempFiles();
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// 应用退出前清理（确保在所有窗口关闭前执行）
app.on('before-quit', async (event) => {
    console.log('[Electron] App quitting, cleaning up...');
    // 阻止默认退出行为，等待清理完成
    event.preventDefault();
    try {
        await cleanupAllTempFiles();
        console.log('[Electron] Cleanup completed, exiting...');
        app.exit(0);
    } catch (error) {
        console.error('[Electron] Error during cleanup:', error);
        app.exit(1);
    }
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
    console.error('[Electron] Uncaught exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('[Electron] Unhandled rejection at:', promise, 'reason:', reason);
});