const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    // --- 窗口控制 ---
    minimize: () => ipcRenderer.send('window-min'),
    close: () => ipcRenderer.send('window-close'),
    maximize: () => ipcRenderer.send('window-max'),

    // --- 初始化引导 ---
    selectDirectory: () => ipcRenderer.invoke('select-directory'),
    completeSetup: (data) => ipcRenderer.invoke('complete-setup', data),

    // --- 设置与系统 ---
    getSystemFonts: () => ipcRenderer.invoke('get-system-fonts'),
    saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
    getSettings: () => ipcRenderer.invoke('get-settings'),
    getDefaultFormat: () => ipcRenderer.invoke('get-default-format'),
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    openExternal: (url) => ipcRenderer.invoke('open-external', url),
    onSettingsUpdated: (callback) => ipcRenderer.on('settings-updated', (event, val) => callback(val)),

    // --- 文章管理核心 ---
    getArticles: () => ipcRenderer.invoke('get-articles'),
    
    // 创建文章
    createArticle: (title, format) => ipcRenderer.invoke('create-article', { title, format }),
    
    // 获取内容
    getArticleContent: (id) => ipcRenderer.invoke('get-article-content', id),
    
    // 保存文章
    saveArticle: (id, content, title, isFinalSave = false) => ipcRenderer.invoke('save-article', { id, content, title, isFinalSave }),
    
    // 临时文件缓存管理
    startArticleCache: (id, filePath) => ipcRenderer.invoke('start-article-cache', { id, filePath }),
    stopArticleCache: (id, filePath) => ipcRenderer.invoke('stop-article-cache', { id, filePath }),
    
    // [新增] 删除文章
    deleteArticle: (id, deleteFile = true) => ipcRenderer.invoke('delete-article', { id, deleteFile }),

    // --- 高级功能 ---
    // 格式转换
    convertFormat: (id, fmt) => ipcRenderer.invoke('convert-format', { articleId: id, targetFormat: fmt }),
    
    // 历史快照 (时光机)
    getSnapshots: (id) => ipcRenderer.invoke('get-snapshots', id),
    restoreSnapshot: (id, content) => ipcRenderer.invoke('restore-snapshot', { articleId: id, content }),
    renameArticle: (id, newTitle) => ipcRenderer.invoke('rename-article', { id, newTitle }),
    
    // 导出文章
    exportArticle: (id, format) => ipcRenderer.invoke('export-article', { articleId: id, format }),
    
    // 打开外部文件
    openExternalFile: () => ipcRenderer.invoke('open-external-file'),
    
    // 运行日志
    getLogs: (date = null) => ipcRenderer.invoke('get-logs', date),
    getAvailableLogDates: () => ipcRenderer.invoke('get-available-log-dates'),
    logRendererError: (errorInfo) => ipcRenderer.invoke('log-renderer-error', errorInfo),
    
    // 窗口状态变化事件
    onWindowResizingStart: (callback) => ipcRenderer.on('window-resizing-start', () => callback()),
    onWindowResizingEnd: (callback) => ipcRenderer.on('window-resizing-end', () => callback()),
    onWindowMaximized: (callback) => ipcRenderer.on('window-maximized', () => callback()),
    onWindowUnmaximized: (callback) => ipcRenderer.on('window-unmaximized', () => callback()),
    
    // 语言变化事件
    onLanguageChanged: (callback) => ipcRenderer.on('language-changed', (event, locale) => callback(locale)),
});