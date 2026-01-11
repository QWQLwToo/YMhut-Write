import { computed, ref, watch, nextTick } from 'vue';

/**
 * 字符统计功能模块
 * 提供实时字符数统计功能
 */
export function useWordCount(getCurrentArticle, getMdSource, getContent) {
    // 当前文本内容（响应式）
    const currentText = ref('');
    
    /**
     * 获取当前编辑器的文本内容
     */
    const getCurrentText = () => {
        const currentArticle = getCurrentArticle();
        if (!currentArticle) {
            return '';
        }
        
        if (currentArticle.format === 'md') {
            // Markdown 编辑器
            return getMdSource() || '';
        } else {
            // 富文本编辑器
            const editor = document.getElementById('my-text-editor');
            if (editor) {
                // 优先使用 textContent（纯文本，不含HTML标签）
                return editor.textContent || editor.innerText || '';
            }
            // 如果编辑器不存在，尝试从 content 中提取纯文本
            const contentValue = getContent();
            if (contentValue) {
                // 如果是HTML，提取纯文本
                if (contentValue.trim().startsWith('<')) {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = contentValue;
                    return tempDiv.textContent || tempDiv.innerText || '';
                }
                return contentValue;
            }
            return '';
        }
    };
    
    /**
     * 更新当前文本内容
     */
    const updateText = () => {
        nextTick(() => {
            currentText.value = getCurrentText();
        });
    };
    
    // 监听内容变化
    watch([() => getCurrentArticle()?.id, () => getMdSource(), () => getContent()], () => {
        updateText();
    }, { immediate: true, deep: true });
    
    // 监听编辑器内容变化（通过定时检查，因为 contenteditable 的 input 事件可能不够及时）
    let textUpdateTimer = null;
    const startTextUpdate = () => {
        if (textUpdateTimer) clearInterval(textUpdateTimer);
        textUpdateTimer = setInterval(() => {
            if (getCurrentArticle()) {
                const newText = getCurrentText();
                if (newText !== currentText.value) {
                    currentText.value = newText;
                }
            }
        }, 300); // 每300ms检查一次
    };
    
    const stopTextUpdate = () => {
        if (textUpdateTimer) {
            clearInterval(textUpdateTimer);
            textUpdateTimer = null;
        }
    };
    
    // 当文档切换时，重新启动更新
    watch(() => getCurrentArticle()?.id, () => {
        stopTextUpdate();
        updateText();
        if (getCurrentArticle()) {
            startTextUpdate();
        }
    });
    
    /**
     * 字符数（含空格）- 用于左下角显示
     */
    const characterCount = computed(() => {
        return currentText.value.length;
    });
    
    /**
     * 详细的统计信息 - 用于弹窗显示
     */
    const wordStats = computed(() => {
        const text = currentText.value;
        
        // 基础统计
        const chars = text.length;
        const charsNoSpaces = text.replace(/\s+/g, '').length;
        
        // 中文字符统计（包括中文标点）
        const chineseChars = (text.match(/[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/g) || []).length;
        
        // 中文标点统计
        const chinesePunctuation = (text.match(/[，。！？；：""''（）【】《》…—、]/g) || []).length;
        
        // 英文单词统计（按空格和标点分割）
        const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
        
        // 数字统计
        const numbers = (text.match(/\d+/g) || []).length;
        
        // 总字数（中文按字符数，英文按单词数）
        const totalWords = chineseChars + englishWords;
        
        // 段落统计（空行分隔）
        const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(p => p.trim()).length : 0;
        
        // 行数统计（包括空行）
        const lines = text.split('\n').length;
        
        // 句子统计（中英文标点）
        const sentences = text.split(/[.!?。！？]+/).filter(s => s.trim()).length;
        
        return {
            chars,                    // 字符数（含空格）
            charsNoSpaces,           // 字符数（不含空格）
            chineseChars,            // 中文字符数
            chinesePunctuation,     // 中文标点数
            englishWords,            // 英文单词数
            numbers,                 // 数字个数
            words: totalWords,        // 总字数（中文+英文单词）
            paragraphs,              // 段落数
            lines,                   // 行数
            sentences                // 句子数
        };
    });
    
    return {
        characterCount,
        wordStats,
        updateText,
        startTextUpdate,
        stopTextUpdate
    };
}
