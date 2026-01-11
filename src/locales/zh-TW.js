// 繁體中文
export default {
  // 通用
  common: {
    next: '下一步',
    previous: '上一步',
    finish: '完成設置',
    cancel: '取消',
    confirm: '確認',
    save: '儲存',
    delete: '刪除',
    edit: '編輯',
    close: '關閉',
    select: '選擇',
    export: '匯出',
    exportAs: '匯出為...',
    rename: '重新命名',
    convert: '格式轉換',
    copy: '複製',
    cut: '剪下',
    paste: '貼上',
    settings: '設定',
    about: '關於',
    appearance: '外觀',
    editor: '編輯器',
    general: '通用設定',
    logs: '執行日誌',
    language: '語言',
    simplifiedChinese: '簡體中文',
    traditionalChinese: '繁體中文',
    english: 'English'
  },
  
  // 設置精靈
  setup: {
    welcome: {
      title: '歡迎使用 YMhut-Write',
      description: '感謝您選擇 YMhut-Write！這是一個專為"輕量級"打造的專業寫作工具。\n讓我們花幾分鐘時間完成初始設置，開啟您的靈動創作之旅。'
    },
    language: {
      title: '選擇語言',
      description: '請選擇您偏好的介面語言',
      selectLanguage: '選擇語言'
    },
    storage: {
      title: '儲存配置',
      dbPath: '資料庫位置 (Data)',
      docPath: '文件存放位置 (Docs)'
    },
    integration: {
      title: '系統整合',
      autoStart: '開機自動啟動',
      autoStartDesc: '啟動時自動開啟 YMhut-Write'
    },
    format: {
      title: '預設格式',
      description: '選擇建立新文件時的預設格式',
      markdown: 'Markdown',
      plainText: '純文字'
    }
  },
  
  // 設定介面
  settings: {
    theme: {
      title: '主題模式',
      themeMode: '主題模式',
      light: '淺色模式',
      dark: '深色模式'
    },
    editor: {
      markdown: 'Markdown 編輯器',
      showRawMd: '顯示 Markdown 原始碼',
      showRawMdDesc: '關閉後將顯示渲染後的預覽效果',
      typewriterMode: '打字機模式',
      typewriterModeDesc: '始終將當前行保持在螢幕中央',
      focusMode: '專注模式',
      focusModeDesc: '淡化其他內容，突出當前段落',
      sourceMode: '原始碼模式',
      sourceModeDesc: '僅顯示原始碼，隱藏預覽'
    },
    general: {
      title: '通用設定',
      fontFamily: '寫作字體',
      followSystem: '跟隨系統',
      fontSize: '預設字號',
      autoSave: '自動儲存',
      autoSaveDesc: '編輯時自動儲存內容',
      showLineNumbers: '顯示行號',
      showLineNumbersDesc: '在編輯器左側顯示行號（類似IDE）',
      outlineMode: '大綱模式',
      outlineModeDesc: '自動識別文章或小說的大綱結構',
      language: '介面語言',
      languageDesc: '選擇應用程式的介面語言'
    },
    about: {
      title: '關於',
      subtitle: '輕量級寫作編輯器',
      version: '版本',
      author: '作者',
      updateDate: '更新日期',
      repository: '開源倉庫',
      issues: '問題回報',
      license: '開源協議',
      description: 'YMhut-Write 是一個專為輕量級寫作設計的編輯器，支援 Markdown 和純文字格式。\n適合寫文章、小說、週報等各類文件。簡潔、高效、專注創作。'
    },
    logs: {
      title: '執行日誌',
      selectDate: '選擇日期',
      selectDateDesc: '查看不同日期的執行日誌',
      today: '今天',
      yesterday: '昨天',
      noLogs: '暫無日誌記錄',
      noLogsDesc: '當出現錯誤時，日誌將自動記錄在這裡',
      copy: '複製',
      copied: '已複製',
      copyFailed: '複製失敗'
    }
  },
  
  // 工作區
  workspace: {
    sidebar: {
      documents: '文稿庫',
      history: '歷史存檔',
      allDocuments: '所有文稿',
      refreshHistory: '重新整理歷史記錄',
      newDocument: '新建文件',
      openFile: '開啟文件',
      noTitle: '無標題文件',
      noHistoryBackup: '暫無歷史備份',
      autoBackup: '文件儲存時會自動建立備份',
      selectOrCreate: '請選擇或建立文件',
      noDocumentSelected: '未選擇文件',
      selectFileFirst: '請先在文稿庫選擇一個文件'
    },
    editor: {
      title: '標題',
      placeholder: '請輸入文件標題...',
      wordCount: '字元',
      startWriting: '在此處開始你的創作...',
      status: {
        ready: '就緒',
        writing: '同步中...',
        saved: '已儲存'
      }
    },
    contextMenu: {
      rename: '重新命名',
      delete: '刪除',
      export: '匯出',
      convert: '格式轉換'
    },
    export: {
      title: '匯出為...',
      selectFormat: '選擇匯出格式',
      txt: 'TXT',
      json: 'JSON',
      docx: 'Word 文件'
    },
    convert: {
      title: '格式轉換',
      currentFormat: '目前格式',
      selectFormat: '選擇目標格式',
      renameTitle: '重新命名文件'
    },
    createModal: {
      documentName: '文件名稱',
      documentNamePlaceholder: '輸入文件名稱（可選）',
      defaultNameHint: '留空將使用預設名稱',
      documentFormat: '文件格式',
      plainText: '純文字',
      plainTextFormat: '純文字格式'
    },
    delete: {
      title: '確認刪除',
      message: '確定要刪除此文件嗎？此操作無法撤銷。',
      deleteFile: '同時刪除文件'
    },
    wordStats: {
      title: '字數統計',
      chars: '字元數（含空格）',
      charsNoSpaces: '字元數（不含空格）',
      words: '總字數',
      wordsDesc: '中文+英文單字',
      chineseChars: '中文字元',
      chinesePunctuation: '中文標點',
      englishWords: '英文單字',
      numbers: '數字',
      paragraphs: '段落數',
      lines: '行數',
      sentences: '句子數'
    }
  },
  
  // 訊息提示
  messages: {
    saved: '設定已儲存',
    createFailed: '建立文件失敗',
    deleteFailed: '刪除文件失敗',
    exportFailed: '匯出失敗',
    renameFailed: '重新命名失敗',
    convertFailed: '格式轉換失敗',
    convertSuccess: '格式轉換成功！已另存為新文件。',
    convertSuccessRefresh: '轉換成功，但未找到新文件。請重新整理列表查看。',
    sameFormat: '格式相同，無需轉換',
    openFileFailed: '開啟文件失敗',
    openFailed: '開啟失敗',
    unknownError: '未知錯誤',
    selectDocumentFirst: '請先選擇一個文件',
    inputNewName: '輸入新名稱',
    restoreVersion: '確定要恢復到 {time} 的版本嗎？\n目前內容將被覆蓋。',
    restoreSuccess: '恢復成功',
    restoreTitle: '恢復歷史版本'
  }
};
