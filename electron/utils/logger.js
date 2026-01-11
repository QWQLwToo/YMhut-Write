const fs = require('fs-extra');
const path = require('path');
const paths = require('./paths');

// 确保日志目录存在
const logDir = path.join(paths.data, 'logs');
fs.ensureDirSync(logDir);

// 日志文件路径
const getLogFilePath = () => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return path.join(logDir, `app-${today}.log`);
};

/**
 * 写入日志
 * @param {string} level - 日志级别: 'error', 'warn', 'info'
 * @param {string} message - 日志消息
 * @param {Error|Object} error - 错误对象（可选）
 */
function writeLog(level, message, error = null) {
    try {
        const timestamp = new Date().toISOString();
        const logFile = getLogFilePath();
        
        let logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
        
        if (error) {
            if (error instanceof Error) {
                logEntry += `\n错误详情: ${error.message}`;
                if (error.stack) {
                    logEntry += `\n堆栈跟踪:\n${error.stack}`;
                }
            } else if (typeof error === 'object') {
                logEntry += `\n错误详情: ${JSON.stringify(error, null, 2)}`;
            } else {
                logEntry += `\n错误详情: ${error}`;
            }
        }
        
        logEntry += '\n' + '-'.repeat(80) + '\n';
        
        // 追加到日志文件
        fs.appendFileSync(logFile, logEntry, 'utf-8');
        
        // 控制台输出（仅错误）
        if (level === 'error') {
            console.error(`[${timestamp}] ${message}`, error || '');
        }
    } catch (e) {
        console.error('Failed to write log:', e);
    }
}

/**
 * 记录错误日志
 */
function logError(message, error = null) {
    writeLog('error', message, error);
}

/**
 * 记录警告日志（可选，根据需求决定是否记录）
 */
function logWarn(message, error = null) {
    // 根据需求，警告可能不需要记录
    // writeLog('warn', message, error);
}

/**
 * 记录信息日志
 */
function logInfo(message) {
    writeLog('info', message);
}

/**
 * 读取日志文件
 * @param {string} date - 日期字符串 (YYYY-MM-DD)，默认为今天
 * @returns {Array} 日志条目数组
 */
function readLogs(date = null) {
    try {
        const targetDate = date || new Date().toISOString().split('T')[0];
        const logFile = path.join(logDir, `app-${targetDate}.log`);
        
        if (!fs.existsSync(logFile)) {
            return [];
        }
        
        const content = fs.readFileSync(logFile, 'utf-8');
        const entries = [];
        
        // 按分隔符分割日志条目
        const blocks = content.split('\n' + '-'.repeat(80) + '\n').filter(block => block.trim());
        
        blocks.forEach(block => {
            const lines = block.split('\n').filter(line => line.trim());
            if (lines.length === 0) return;
            
            // 解析第一行获取时间戳和级别
            const headerMatch = lines[0].match(/\[([^\]]+)\] \[([^\]]+)\] (.+)/);
            if (headerMatch) {
                const [, timestamp, level, message] = headerMatch;
                const details = lines.slice(1).join('\n');
                
                entries.push({
                    timestamp,
                    level: level.toLowerCase(),
                    message,
                    details: details || null,
                    fullText: block.trim()
                });
            }
        });
        
        return entries.reverse(); // 最新的在前
    } catch (e) {
        console.error('Failed to read logs:', e);
        return [];
    }
}

/**
 * 获取可用的日志文件列表
 * @returns {Array} 日期字符串数组
 */
function getAvailableLogDates() {
    try {
        const files = fs.readdirSync(logDir);
        const dates = files
            .filter(file => file.startsWith('app-') && file.endsWith('.log'))
            .map(file => file.replace('app-', '').replace('.log', ''))
            .sort()
            .reverse(); // 最新的在前
        
        return dates;
    } catch (e) {
        console.error('Failed to get log dates:', e);
        return [];
    }
}

/**
 * 清理旧日志（保留最近N天）
 * @param {number} daysToKeep - 保留天数，默认30天
 */
function cleanupOldLogs(daysToKeep = 30) {
    try {
        const files = fs.readdirSync(logDir);
        const now = Date.now();
        const maxAge = daysToKeep * 24 * 60 * 60 * 1000; // 毫秒
        
        files.forEach(file => {
            if (file.startsWith('app-') && file.endsWith('.log')) {
                const filePath = path.join(logDir, file);
                const stats = fs.statSync(filePath);
                const age = now - stats.mtimeMs;
                
                if (age > maxAge) {
                    fs.unlinkSync(filePath);
                    console.log(`Deleted old log file: ${file}`);
                }
            }
        });
    } catch (e) {
        console.error('Failed to cleanup old logs:', e);
    }
}

module.exports = {
    logError,
    logWarn,
    logInfo,
    readLogs,
    getAvailableLogDates,
    cleanupOldLogs
};
