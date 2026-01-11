const fs = require('fs-extra');
const matter = require('gray-matter'); // 用于处理 FrontMatter

const converter = {
    // 读取文件并统一转换为内部对象
    readFile: async (filePath, type) => {
        const raw = await fs.readFile(filePath, 'utf-8');
        let content = '';
        let meta = {};

        if (type === 'json') {
            const parsed = JSON.parse(raw);
            content = parsed.content || '';
            meta = parsed.meta || {};
        } else if (type === 'md') {
            const parsed = matter(raw);
            content = parsed.content;
            meta = parsed.data;
        } else {
            // txt
            content = raw;
        }
        return { content, meta };
    },

    // 导出文件
    exportFile: async (targetPath, content, meta, type) => {
        let output = '';
        if (type === 'json') {
            output = JSON.stringify({ meta, content }, null, 2);
        } else if (type === 'md') {
            output = matter.stringify(content, meta);
        } else {
            // txt (丢失 meta 信息，仅保留内容)
            output = content;
        }
        await fs.writeFile(targetPath, output, 'utf-8');
    }
};

module.exports = converter;