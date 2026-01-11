// English
export default {
  // Common
  common: {
    next: 'Next',
    previous: 'Previous',
    finish: 'Finish Setup',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    select: 'Select',
    export: 'Export',
    exportAs: 'Export as...',
    rename: 'Rename',
    convert: 'Format Conversion',
    copy: 'Copy',
    cut: 'Cut',
    paste: 'Paste',
    settings: 'Settings',
    about: 'About',
    appearance: 'Appearance',
    editor: 'Editor',
    general: 'General Settings',
    logs: 'Runtime Logs',
    language: 'Language',
    simplifiedChinese: '简体中文',
    traditionalChinese: '繁體中文',
    english: 'English'
  },
  
  // Setup Wizard
  setup: {
    welcome: {
      title: 'Welcome to YMhut-Write',
      description: 'Thank you for choosing YMhut-Write! This is a professional writing tool designed for "lightweight" use.\nLet\'s spend a few minutes completing the initial setup to start your creative journey.'
    },
    language: {
      title: 'Select Language',
      description: 'Please select your preferred interface language',
      selectLanguage: 'Select Language'
    },
    storage: {
      title: 'Storage Configuration',
      dbPath: 'Database Location (Data)',
      docPath: 'Document Storage Location (Docs)'
    },
    integration: {
      title: 'System Integration',
      autoStart: 'Auto Start on Boot',
      autoStartDesc: 'Automatically open YMhut-Write on startup'
    },
    format: {
      title: 'Default Format',
      description: 'Select the default format when creating new documents',
      markdown: 'Markdown',
      plainText: 'Plain Text'
    }
  },
  
  // Settings
  settings: {
    theme: {
      title: 'Theme Mode',
      themeMode: 'Theme Mode',
      light: 'Light Mode',
      dark: 'Dark Mode'
    },
    editor: {
      markdown: 'Markdown Editor',
      showRawMd: 'Show Markdown Source',
      showRawMdDesc: 'When disabled, the rendered preview will be shown',
      typewriterMode: 'Typewriter Mode',
      typewriterModeDesc: 'Always keep the current line centered on screen',
      focusMode: 'Focus Mode',
      focusModeDesc: 'Dim other content, highlight current paragraph',
      sourceMode: 'Source Code Mode',
      sourceModeDesc: 'Show source code only, hide preview'
    },
    general: {
      title: 'General Settings',
      fontFamily: 'Writing Font',
      followSystem: 'Follow System',
      fontSize: 'Default Font Size',
      autoSave: 'Auto Save',
      autoSaveDesc: 'Automatically save content while editing',
      showLineNumbers: 'Show Line Numbers',
      showLineNumbersDesc: 'Display line numbers on the left side of the editor (like IDE)',
      outlineMode: 'Outline Mode',
      outlineModeDesc: 'Automatically recognize article or novel outline structure',
      language: 'Interface Language',
      languageDesc: 'Select the application interface language'
    },
    about: {
      title: 'About',
      subtitle: 'Lightweight Writing Editor',
      version: 'Version',
      author: 'Author',
      updateDate: 'Update Date',
      repository: 'Open Source Repository',
      issues: 'Issue Feedback',
      license: 'Open Source License',
      description: 'YMhut-Write is an editor designed for lightweight writing, supporting Markdown and plain text formats.\nSuitable for articles, novels, weekly reports and other documents. Simple, efficient, focused on creation.'
    },
    logs: {
      title: 'Runtime Logs',
      selectDate: 'Select Date',
      selectDateDesc: 'View runtime logs for different dates',
      today: 'Today',
      yesterday: 'Yesterday',
      noLogs: 'No Log Records',
      noLogsDesc: 'When errors occur, logs will be automatically recorded here'
    }
  },
  
  // Workspace
  workspace: {
    sidebar: {
      documents: 'Documents',
      history: 'History Archive',
      allDocuments: 'All Documents',
      refreshHistory: 'Refresh History',
      newDocument: 'New Document',
      openFile: 'Open File',
      noTitle: 'Untitled Document',
      noHistoryBackup: 'No History Backup',
      autoBackup: 'Backups are automatically created when documents are saved',
      selectOrCreate: 'Please select or create a document',
      noDocumentSelected: 'No Document Selected',
      selectFileFirst: 'Please select a file from the document library first'
    },
    editor: {
      title: 'Title',
      placeholder: 'Please enter document title...',
      wordCount: 'Characters',
      startWriting: 'Start writing here...',
      status: {
        ready: 'Ready',
        writing: 'Syncing...',
        saved: 'Saved'
      }
    },
    contextMenu: {
      rename: 'Rename',
      delete: 'Delete',
      export: 'Export',
      convert: 'Format Conversion'
    },
    export: {
      title: 'Export as...',
      selectFormat: 'Select Export Format',
      txt: 'TXT',
      json: 'JSON',
      docx: 'Word Document'
    },
    convert: {
      title: 'Format Conversion',
      currentFormat: 'Current Format',
      selectFormat: 'Select Target Format',
      renameTitle: 'Rename Document'
    },
    createModal: {
      documentName: 'Document Name',
      documentNamePlaceholder: 'Enter document name (optional)',
      defaultNameHint: 'Leave blank to use default name',
      documentFormat: 'Document Format',
      plainText: 'Plain Text',
      plainTextFormat: 'Plain Text Format'
    },
    delete: {
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this document?',
      deleteFile: 'Also Delete File'
    },
    wordStats: {
      title: 'Word Statistics',
      chars: 'Characters (with spaces)',
      charsNoSpaces: 'Characters (without spaces)',
      words: 'Total Words',
      wordsDesc: 'Chinese + English Words',
      chineseChars: 'Chinese Characters',
      chinesePunctuation: 'Chinese Punctuation',
      englishWords: 'English Words',
      numbers: 'Numbers',
      paragraphs: 'Paragraphs',
      lines: 'Lines',
      sentences: 'Sentences'
    }
  },
  
  // Messages
  messages: {
    saved: 'Settings saved',
    createFailed: 'Failed to create document',
    deleteFailed: 'Failed to delete document',
    exportFailed: 'Export failed',
    renameFailed: 'Rename failed',
    convertFailed: 'Format conversion failed',
    convertSuccess: 'Format conversion successful! Saved as new document.',
    convertSuccessRefresh: 'Conversion successful, but new document not found. Please refresh the list to view.',
    sameFormat: 'Same format, no conversion needed',
    openFileFailed: 'Failed to open file',
    openFailed: 'Open Failed',
    unknownError: 'Unknown Error',
    selectDocumentFirst: 'Please select a document first',
    inputNewName: 'Enter new name',
    restoreVersion: 'Are you sure you want to restore to the version from {time}?\nCurrent content will be overwritten.',
    restoreSuccess: 'Restore successful',
    restoreTitle: 'Restore History Version'
  }
};
