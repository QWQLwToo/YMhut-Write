const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs-extra');
const paths = require('./paths');
const dayjs = require('dayjs');

// 确保数据目录存在
fs.ensureDirSync(paths.data);

// --- 数据库 1: 系统配置库 ---
const sysDbPath = path.join(paths.data, 'system.db');
const sysDb = new Database(sysDbPath);

sysDb.exec(`
  CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY, value TEXT);
`);

// --- 数据库 2: 文档内容库 ---
const docDbPath = path.join(paths.data, 'content.db');
const docDb = new Database(docDbPath);

// 启用 WAL 模式以支持并发读取和写入
docDb.pragma('journal_mode = WAL');
docDb.pragma('synchronous = NORMAL'); // 平衡性能和安全性

docDb.exec(`
  CREATE TABLE IF NOT EXISTS articles (
    id TEXT PRIMARY KEY,
    title TEXT,
    path TEXT,
    format TEXT,
    created_at TEXT,
    updated_at TEXT
  );
  CREATE TABLE IF NOT EXISTS article_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id TEXT,
    content TEXT,
    snapshot_time TEXT
  );
`);

// 数据库操作队列：确保数据库操作按顺序执行，避免锁死
const dbOperationQueues = new Map();

/**
 * 队列化数据库操作
 * @param {string} queueKey - 队列标识（例如：'docDb' 或 'sysDb'）
 * @param {Function} operation - 要执行的数据库操作函数
 * @returns {Promise} 操作结果
 */
async function queueDbOperation(queueKey, operation) {
    // 获取该队列的当前操作，如果没有则新建一个 Resolved Promise
    let previousOp = dbOperationQueues.get(queueKey) || Promise.resolve();

    // 创建新的操作任务，必须等待上一个任务完成
    const currentOp = previousOp
        .then(() => {
            try {
                return operation();
            } catch (err) {
                console.error(`[DB Error] Operation failed in queue ${queueKey}:`, err);
                throw err;
            }
        })
        .catch((err) => {
            console.error(`[DB Error] Queue operation failed for ${queueKey}:`, err);
            throw err;
        });

    // 更新队列指针
    dbOperationQueues.set(queueKey, currentOp);

    // 等待当前任务完成
    return currentOp;
}

// 分钟级备份逻辑（保留最近5次）- 异步队列化
async function saveSnapshot(articleId, content) {
    // 使用队列确保不会阻塞其他操作
    return queueDbOperation('snapshot', () => {
        try {
            const now = dayjs().format();
            const insert = docDb.prepare('INSERT INTO article_snapshots (article_id, content, snapshot_time) VALUES (?, ?, ?)');
            insert.run(articleId, content, now);

            // 清理旧备份
            const countStmt = docDb.prepare('SELECT COUNT(*) as count FROM article_snapshots WHERE article_id = ?');
            const result = countStmt.get(articleId);
            
            if (result.count > 5) {
                const deleteStmt = docDb.prepare(`
                    DELETE FROM article_snapshots 
                    WHERE id = (SELECT id FROM article_snapshots WHERE article_id = ? ORDER BY snapshot_time ASC LIMIT 1)
                `);
                deleteStmt.run(articleId);
            }
            return true;
        } catch (err) {
            console.error('Backup failed:', err);
            return false;
        }
    });
}

/**
 * 队列化文档数据库操作
 */
async function queueDocDbOperation(operation) {
    return queueDbOperation('docDb', operation);
}

/**
 * 队列化系统数据库操作
 */
async function queueSysDbOperation(operation) {
    return queueDbOperation('sysDb', operation);
}

module.exports = { 
    sysDb, 
    docDb, 
    saveSnapshot,
    queueDocDbOperation,
    queueSysDbOperation
};