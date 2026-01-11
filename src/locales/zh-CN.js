// 简体中文
export default {
  // 通用
  common: {
    next: '下一步',
    previous: '上一步',
    finish: '完成设置',
    cancel: '取消',
    confirm: '确认',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    close: '关闭',
    select: '选择',
    export: '导出',
    exportAs: '导出为...',
    rename: '重命名',
    convert: '格式转换',
    copy: '复制',
    cut: '剪切',
    paste: '粘贴',
    settings: '设置',
    about: '关于',
    appearance: '外观',
    editor: '编辑器',
    general: '通用设置',
    logs: '运行日志',
    language: '语言',
    simplifiedChinese: '简体中文',
    traditionalChinese: '繁体中文',
    english: 'English'
  },
  
  // 设置向导
  setup: {
    welcome: {
      title: '欢迎使用 YMhut-Write',
      description: '感谢您选择 YMhut-Write！这是一个专为"轻量级"打造的专业写作工具。\n让我们花几分钟时间完成初始设置，开启您的灵动创作之旅。'
    },
    language: {
      title: '选择语言',
      description: '请选择您偏好的界面语言',
      selectLanguage: '选择语言'
    },
    storage: {
      title: '存储配置',
      dbPath: '数据库位置 (Data)',
      docPath: '文档存放位置 (Docs)'
    },
    integration: {
      title: '系统集成',
      autoStart: '开机自启动',
      autoStartDesc: '启动时自动打开 YMhut-Write'
    },
    format: {
      title: '默认格式',
      description: '选择创建新文档时的默认格式',
      markdown: 'Markdown',
      plainText: '纯文本'
    }
  },
  
  // 设置界面
  settings: {
    theme: {
      title: '主题模式',
      light: '浅色模式',
      dark: '深色模式'
    },
    editor: {
      markdown: 'Markdown 编辑器',
      showRawMd: '显示 Markdown 源码',
      showRawMdDesc: '关闭后将显示渲染后的预览效果',
      typewriterMode: '打字机模式',
      typewriterModeDesc: '始终将当前行保持在屏幕中央',
      focusMode: '专注模式',
      focusModeDesc: '淡化其他内容，突出当前段落',
      sourceMode: '源代码模式',
      sourceModeDesc: '仅显示源代码，隐藏预览'
    },
    general: {
      fontFamily: '写作字体',
      fontSize: '默认字号',
      autoSave: '自动保存',
      autoSaveDesc: '编辑时自动保存内容',
      showLineNumbers: '显示行号',
      showLineNumbersDesc: '在编辑器左侧显示行号（类似IDE）',
      outlineMode: '大纲模式',
      outlineModeDesc: '自动识别文章或小说的大纲结构',
      language: '界面语言',
      languageDesc: '选择应用程序的界面语言'
    },
    about: {
      title: '关于',
      subtitle: '轻量级写作编辑器',
      version: '版本',
      author: '作者',
      updateDate: '更新日期',
      repository: '开源仓库',
      issues: '问题反馈',
      license: '开源协议',
      description: 'YMhut-Write 是一个专为轻量级写作设计的编辑器，支持 Markdown 和纯文本格式。\n适合写文章、小说、周报等各类文档。简洁、高效、专注创作。'
    },
    logs: {
      title: '运行日志',
      selectDate: '选择日期',
      selectDateDesc: '查看不同日期的运行日志',
      today: '今天',
      yesterday: '昨天',
      noLogs: '暂无日志记录',
      noLogsDesc: '当出现错误时，日志将自动记录在这里'
    }
  },
  
  // 工作区
  workspace: {
    sidebar: {
      allDocuments: '所有文稿',
      history: '历史记录',
      newDocument: '新建文档',
      openFile: '打开文件'
    },
    editor: {
      title: '标题',
      placeholder: '请输入文档标题...',
      wordCount: '字符',
      status: {
        ready: '就绪',
        writing: '同步中...',
        saved: '已保存'
      }
    },
    contextMenu: {
      rename: '重命名',
      delete: '删除',
      export: '导出',
      convert: '格式转换'
    },
    export: {
      title: '导出为...',
      selectFormat: '选择导出格式',
      txt: 'TXT',
      json: 'JSON',
      docx: 'Word 文档'
    },
    convert: {
      title: '格式转换',
      currentFormat: '当前格式',
      selectFormat: '选择目标格式'
    },
    delete: {
      title: '确认删除',
      message: '确定要删除此文档吗？',
      deleteFile: '同时删除文件'
    },
    wordStats: {
      title: '字数统计',
      chars: '字符数（含空格）',
      charsNoSpaces: '字符数（不含空格）',
      words: '总字数',
      wordsDesc: '中文+英文单词',
      chineseChars: '中文字符',
      chinesePunctuation: '中文标点',
      englishWords: '英文单词',
      numbers: '数字',
      paragraphs: '段落数',
      lines: '行数',
      sentences: '句子数'
    }
  },
  
  // 消息提示
  messages: {
    saved: '设置已保存',
    createFailed: '创建文档失败',
    deleteFailed: '删除文档失败',
    exportFailed: '导出失败',
    renameFailed: '重命名失败',
    convertFailed: '格式转换失败',
    openFileFailed: '打开文件失败'
  }
};
