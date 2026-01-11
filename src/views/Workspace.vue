<template>
  <div class="flex h-screen w-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white font-sans overflow-hidden transition-colors duration-300" @click="handleGlobalClick">
    
    <DynamicIsland :status="appStatus" @action="handleIslandAction" />

    <div class="fixed top-4 right-4 flex items-center gap-3 z-[9999] [-webkit-app-region:no-drag]">
      <button 
        @click="router.push('/settings')" 
        class="w-8 h-8 rounded-lg bg-white/80 dark:bg-gray-900/80 hover:bg-white dark:hover:bg-gray-800 border border-gray-200/60 dark:border-gray-800/60 shadow-sm flex items-center justify-center transition-all hover:scale-105 active:scale-95 group text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
        title="设置"
      >
        <Icon name="settings" :size="16" color="currentColor" />
      </button>
      <div class="flex gap-2">
        <button @click="minimize" class="w-3.5 h-3.5 rounded-full bg-[#FF5F57] border border-[#E0443E] shadow-sm hover:brightness-90 transition"></button>
        <button @click="maximize" class="w-3.5 h-3.5 rounded-full bg-[#FEBC2E] border border-[#D89E24] shadow-sm hover:brightness-90 transition"></button>
        <button @click="closeApp" class="w-3.5 h-3.5 rounded-full bg-[#28C840] border border-[#1AAB29] shadow-sm hover:brightness-90 transition"></button>
      </div>
    </div>

    <div class="w-[280px] min-w-[280px] bg-gray-50 dark:bg-black border-r border-gray-200/60 dark:border-gray-800/60 flex flex-col pt-8 pb-4 z-20 shadow-[2px_0_20px_rgba(0,0,0,0.02)] transition-colors duration-300">
      
      <div class="px-4 mb-4 flex items-center justify-between">
        <div class="bg-gray-100/80 dark:bg-gray-900/80 p-1 rounded-lg flex w-full transition-colors">
          <button @click="sidebarTab = 'docs'" class="flex-1 text-[11px] font-bold py-1 rounded-md transition-all flex items-center justify-center gap-1.5" :class="sidebarTab === 'docs' ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'">
            <ph-files :size="14" weight="bold"/> 文稿库
          </button>
          <button @click="switchSidebarToHistory" class="flex-1 text-[11px] font-bold py-1 rounded-md transition-all flex items-center justify-center gap-1.5" :class="sidebarTab === 'history' ? 'bg-white dark:bg-black text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'">
            <ph-clock-counter-clockwise :size="14" weight="bold"/> 历史存档
          </button>
        </div>
      </div>

      <div v-if="sidebarTab === 'docs'" class="flex-1 flex flex-col overflow-hidden">
        <div class="px-5 mb-2 flex items-center justify-between group">
          <span class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-colors">所有文稿</span>
          <button @click="refreshList" class="text-gray-400 dark:text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition p-1 rounded-md hover:bg-gray-200/50 dark:hover:bg-gray-900/50"><ph-arrows-clockwise :size="12" /></button>
        </div>
        
        <div class="flex-1 overflow-y-auto px-3 space-y-1 custom-scrollbar">
          <div 
            v-for="item in articles" 
            :key="item.id" 
            @click="loadArticle(item)"
            @contextmenu.prevent="showContext($event, item)" 
            class="group p-3 rounded-xl cursor-pointer transition-all duration-300 border select-none relative"
            :class="currentArticle?.id === item.id 
              ? 'bg-indigo-50 dark:bg-indigo-950/30 shadow-md border-indigo-200 dark:border-indigo-800 ring-2 ring-indigo-100 dark:ring-indigo-900/50 transform scale-[1.02]' 
              : 'border-transparent hover:bg-gray-100/80 dark:hover:bg-gray-900/50 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm hover:scale-[1.01]'"
          >
            <div class="flex items-center gap-3 mb-1.5">
              <!-- Markdown文档图标 -->
              <div v-if="item.format === 'md'" :class="currentArticle?.id === item.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-800 dark:text-gray-200 shrink-0 transition-colors'">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
              </div>
              <!-- 文本文档图标 -->
              <div v-else :class="currentArticle?.id === item.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 shrink-0 transition-colors'">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>
              <div :class="currentArticle?.id === item.id 
                ? 'text-[13px] font-bold text-indigo-900 dark:text-indigo-200 flex-1 leading-tight min-w-0' 
                : 'text-[13px] font-bold text-gray-700 dark:text-gray-300 flex-1 leading-tight min-w-0 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors'"
                :title="item.title || '无标题文档'"
                style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; word-break: break-word;"
              >
                {{ item.title || '无标题文档' }}
              </div>
            </div>
            <div class="text-[10px] pl-8 flex justify-between transition-colors" :class="currentArticle?.id === item.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'">
              <span>{{ formatTime(item.updated_at) }}</span>
              <span v-if="currentArticle?.id === item.id" class="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse shadow-sm shadow-indigo-500/50"></span>
            </div>
          </div>
        </div>

        <div class="px-4 mt-2 pt-3 border-t border-gray-100 dark:border-gray-800 transition-colors space-y-2">
           <button @click="createNew" class="group w-full py-2.5 bg-black/80 dark:bg-white/10 backdrop-blur-md text-white rounded-xl text-xs font-bold hover:bg-black/90 dark:hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 border border-white/10 dark:border-white/10 hover:border-white/20 dark:hover:border-white/20">
            <ph-plus :size="14" weight="bold" class="transition-transform duration-300 group-hover:rotate-90" /> 
            <span class="transition-all duration-300">新建文档</span>
          </button>
          <button @click="openExternalFile" class="group w-full py-2.5 bg-gray-100/80 dark:bg-gray-900/80 backdrop-blur-md text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center gap-2 border border-gray-200/60 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="transition-transform duration-300 group-hover:scale-110">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <span class="transition-all duration-300">打开文件</span>
          </button>
        </div>
      </div>

      <div v-else class="flex-1 flex flex-col overflow-hidden animate-fade-in">
        <div class="px-5 mb-3 flex items-center justify-between">
          <span class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-colors">{{ currentArticle ? currentArticle.title : '未选择文档' }}</span>
          <button 
            v-if="currentArticle" 
            @click="loadSnapshots" 
            class="text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
            title="刷新历史记录"
          >
            <ph-arrows-clockwise :size="12" />
          </button>
        </div>
        <div v-if="currentArticle" class="flex-1 overflow-y-auto px-3 space-y-2 custom-scrollbar">
           <div v-if="snapshots.length === 0" class="text-center mt-10">
             <ph-clock-counter-clockwise :size="32" class="text-gray-300 dark:text-gray-700 mx-auto mb-2 transition-colors" />
             <p class="text-[10px] text-gray-400 dark:text-gray-500 transition-colors">暂无历史备份</p>
             <p class="text-[9px] text-gray-300 dark:text-gray-600 mt-1 transition-colors">文档保存时会自动创建备份</p>
           </div>
           <div v-for="snap in snapshots" :key="snap.id" class="bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm group hover:border-indigo-200 dark:hover:border-indigo-800 transition-all cursor-pointer" @click="previewSnapshot(snap)">
              <div class="flex justify-between items-center mb-2">
                 <div class="flex items-center gap-2">
                   <ph-clock :size="12" class="text-indigo-500 dark:text-indigo-400" />
                   <span class="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded transition-colors">{{ formatTime(snap.snapshot_time) }}</span>
                 </div>
                 <button 
                   @click.stop="restore(snap)" 
                   class="text-[10px] text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 px-3 py-1 rounded-md transition-all font-bold shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
                 >
                   恢复
                 </button>
              </div>
              <div class="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-3 font-mono bg-gray-50 dark:bg-gray-900 p-2 rounded border border-gray-100 dark:border-gray-800 transition-colors">
                {{ snap.content ? (snap.content.length > 100 ? snap.content.substring(0, 100) + '...' : snap.content) : '(空文档)' }}
              </div>
              <div class="mt-1.5 text-[9px] text-gray-400 dark:text-gray-500 transition-colors">
                {{ snap.content ? (snap.content.replace(/\s+/g, '').length + ' 字') : '0 字' }}
              </div>
           </div>
        </div>
        <div v-else class="flex-1 flex flex-col items-center justify-center text-gray-300 dark:text-gray-600">
          <ph-file-dashed :size="32" class="mb-2 opacity-50"/>
          <p class="text-[10px] text-gray-400 dark:text-gray-500 transition-colors">请先在文稿库选择一个文件</p>
        </div>
      </div>

    </div>

    <div class="flex-1 flex flex-col relative bg-white dark:bg-black h-full shadow-xl z-10 transition-colors duration-300">
        <!-- 顶部拖动区域 - 排除右侧窗口控制按钮区域（约200px） -->
        <div class="absolute top-0 left-0 h-12 [-webkit-app-region:drag] z-50" style="right: 200px;"></div>
        
        <div v-if="currentArticle" :key="currentArticle.id" class="flex-1 flex flex-col h-full relative animate-fade-in">
            <!-- 文档标题区域 - 为顶部浮窗预留空间 -->
            <div class="px-8 pt-24 pb-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black transition-colors">
               <input 
                  v-model="currentArticle.title" 
                  class="text-3xl font-bold bg-transparent border-none outline-none w-full text-gray-900 dark:text-white tracking-tight leading-tight transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-600" 
                  :style="{ fontFamily: userStyle.fontFamily }" 
                  placeholder="文档标题" 
                  @input="handleInput"
               >
            </div>

            <!-- 写作工具栏 - 根据格式显示不同工具 -->
            <div v-if="currentArticle" class="px-8 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2 overflow-x-auto select-none no-scrollbar bg-white dark:bg-black transition-all duration-300 flex-shrink-0 min-w-0">
                <!-- Markdown 格式工具 -->
                <template v-if="currentArticle.format === 'md'">
                    <!-- 文本格式 -->
                    <button @click="insertText('**', '**')" class="toolbar-btn-simple group" title="粗体 (Ctrl+B)">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                            <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6zM6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
                        </svg>
                    </button>
                    <button @click="insertText('*', '*')" class="toolbar-btn-simple group" title="斜体 (Ctrl+I)">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                            <line x1="19" y1="4" x2="10" y2="4"/>
                            <line x1="14" y1="20" x2="5" y2="20"/>
                            <line x1="15" y1="4" x2="9" y2="20"/>
                        </svg>
                    </button>
                    <button @click="insertText('~~', '~~')" class="toolbar-btn-simple group" title="删除线">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                            <path d="M16 4h2a2 2 0 0 1 2 2v14M8 20H6a2 2 0 0 1-2-2V6M4 12h16"/>
                        </svg>
                    </button>
                    
                    <div class="w-[1px] h-5 bg-gray-300 dark:bg-gray-700 mx-1"></div>
                    
                    <!-- 标题 -->
                    <button @click="insertText('# ')" class="toolbar-btn-simple group" title="一级标题 (H1)">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                            <path d="M6 4v16M18 4v16M6 4h6a4 4 0 0 1 4 4v0a4 4 0 0 1-4 4H6M18 4h-6a4 4 0 0 0-4 4v0a4 4 0 0 0 4 4h6"/>
                        </svg>
                    </button>
                    <button @click="insertText('## ')" class="toolbar-btn-simple group" title="二级标题 (H2)">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                            <path d="M6 4v16M18 4v16M6 4h6a4 4 0 0 1 4 4v0a4 4 0 0 1-4 4H6M18 4h-6a4 4 0 0 0-4 4v0a4 4 0 0 0 4 4h6"/>
                            <line x1="6" y1="12" x2="16" y2="12"/>
                        </svg>
                    </button>
                    <button @click="insertText('### ')" class="toolbar-btn-simple group" title="三级标题 (H3)">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                            <path d="M6 4v16M18 4v16M6 4h6a4 4 0 0 1 4 4v0a4 4 0 0 1-4 4H6M18 4h-6a4 4 0 0 0-4 4v0a4 4 0 0 0 4 4h6"/>
                            <line x1="6" y1="8" x2="16" y2="8"/>
                            <line x1="6" y1="16" x2="16" y2="16"/>
                        </svg>
                    </button>
                    <button @click="insertText('#### ')" class="toolbar-btn-simple group" title="四级标题 (H4)">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                            <path d="M4 6h16M4 12h16M4 18h8"/>
                        </svg>
                    </button>
                    
                    <div class="w-[1px] h-5 bg-gray-300 dark:bg-gray-700 mx-1"></div>
                    
                    <!-- 列表 -->
                    <button @click="insertText('- ')" class="toolbar-btn-simple group" title="无序列表">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                            <circle cx="8" cy="6" r="1"/>
                            <circle cx="8" cy="12" r="1"/>
                            <circle cx="8" cy="18" r="1"/>
                            <line x1="12" y1="6" x2="20" y2="6"/>
                            <line x1="12" y1="12" x2="20" y2="12"/>
                            <line x1="12" y1="18" x2="20" y2="18"/>
                        </svg>
                    </button>
                    <button @click="insertText('1. ')" class="toolbar-btn-simple group" title="有序列表">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                            <line x1="10" y1="6" x2="21" y2="6"/>
                            <line x1="10" y1="12" x2="21" y2="12"/>
                            <line x1="10" y1="18" x2="21" y2="18"/>
                            <line x1="3" y1="6" x2="3.01" y2="6"/>
                            <line x1="3" y1="12" x2="3.01" y2="12"/>
                            <line x1="3" y1="18" x2="3.01" y2="18"/>
                        </svg>
                    </button>
                    <button @click="insertText('- [ ] ')" class="toolbar-btn-simple group" title="任务列表">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <path d="M9 12l2 2 4-4"/>
                        </svg>
                    </button>
                    
                    <div class="w-[1px] h-5 bg-gray-300 dark:bg-gray-700 mx-1"></div>
                    
                    <!-- 其他格式 -->
                    <button @click="insertText('> ')" class="toolbar-btn-simple group" title="引用">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                            <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
                            <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
                        </svg>
                    </button>
                    <button @click="insertText('```\n', '\n```')" class="toolbar-btn-simple group" title="代码块">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                            <polyline points="16 18 22 12 16 6"/>
                            <polyline points="8 6 2 12 8 18"/>
                        </svg>
                    </button>
                    <button @click="insertText('`', '`')" class="toolbar-btn-simple group" title="行内代码">
                        <Icon name="code" :size="16" color="currentColor" class="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200"/>
                    </button>
                    
                    <div class="w-[1px] h-5 bg-gray-300 dark:bg-gray-700 mx-1"></div>
                    
                    <!-- 链接和媒体 -->
                    <button @click="insertText('[]()', 3)" class="toolbar-btn-simple group" title="插入链接">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                        </svg>
                    </button>
                    <button @click="insertText('![alt](')" class="toolbar-btn-simple group" title="插入图片">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <path d="M21 15l-5-5L5 21"/>
                        </svg>
                    </button>
                    <button @click="insertText('---\n')" class="toolbar-btn-simple group" title="分隔线">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                            <line x1="3" y1="12" x2="21" y2="12"/>
                        </svg>
                    </button>
                    
                    <div class="w-[1px] h-5 bg-gray-300 dark:bg-gray-700 mx-1"></div>
                    
                    <!-- 实用工具 -->
                    <button @click="insertDateTime" class="toolbar-btn-simple group" title="插入日期时间">
                        <Icon name="calendar" :size="16" color="currentColor" class="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200"/>
                    </button>
                    <button @click="insertTable" class="toolbar-btn-simple group" title="插入表格">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <line x1="3" y1="9" x2="21" y2="9"/>
                            <line x1="9" y1="3" x2="9" y2="21"/>
                        </svg>
                    </button>
                </template>
                
                <!-- 纯文本格式工具 - 专门的文本编辑工具集 -->
                <template v-else>
                    <!-- 文本格式 -->
                    <button @click="formatText('bold')" class="toolbar-btn-simple group" title="粗体 (Ctrl+B)">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                            <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6zM6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
                        </svg>
                    </button>
                    <button @click="formatText('italic')" class="toolbar-btn-simple group" title="斜体 (Ctrl+I)">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                            <line x1="19" y1="4" x2="10" y2="4"/>
                            <line x1="14" y1="20" x2="5" y2="20"/>
                            <line x1="15" y1="4" x2="9" y2="20"/>
                        </svg>
                    </button>
                    <button @click="formatText('underline')" class="toolbar-btn-simple group" title="下划线 (Ctrl+U)">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                            <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3M4 21h16"/>
                        </svg>
                    </button>
                    <button @click="formatText('strikethrough')" class="toolbar-btn-simple group" title="删除线">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                            <path d="M16 4h2a2 2 0 0 1 2 2v14M8 20H6a2 2 0 0 1-2-2V6M4 12h16"/>
                        </svg>
                    </button>
                    
                    <div class="w-[1px] h-5 bg-gray-300 dark:bg-gray-700 mx-1"></div>
                    
                    <!-- 大小写转换 -->
                    <button @click="formatText('uppercase')" class="toolbar-btn-simple group" title="转换为大写">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                            <path d="M3 19V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14M3 19h18M7 9h10M7 15h10"/>
                        </svg>
                    </button>
                    <button @click="formatText('lowercase')" class="toolbar-btn-simple group" title="转换为小写">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                            <path d="M21 5H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zM7 9h10M7 15h10"/>
                        </svg>
                    </button>
                    <button @click="formatText('capitalize')" class="toolbar-btn-simple group" title="首字母大写">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                            <path d="M3 19V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14M3 19h18M7 9h10M7 15h10M7 9l5-5M7 9l5 5"/>
                        </svg>
                    </button>
                    
                    <div class="w-[1px] h-5 bg-gray-300 dark:bg-gray-700 mx-1"></div>
                    
                    <!-- 文本操作 -->
                    <button @click="formatText('clearFormat')" class="toolbar-btn-simple group" title="清除格式">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </button>
                    <button @click="formatText('copy')" class="toolbar-btn-simple group" title="复制选中文本">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                        </svg>
                    </button>
                    <button @click="formatText('duplicate')" class="toolbar-btn-simple group" title="复制当前行">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                            <line x1="9" y1="9" x2="22" y2="9"/>
                            <line x1="9" y1="13" x2="22" y2="13"/>
                        </svg>
                    </button>
                    
                    <div class="w-[1px] h-5 bg-gray-300 dark:bg-gray-700 mx-1"></div>
                    
                    <!-- 缩进和列表 -->
                    <button @click="formatText('indent')" class="toolbar-btn-simple group" title="增加缩进 (Tab)">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                            <line x1="12" y1="5" x2="12" y2="19"/>
                            <polyline points="8 9 12 5 16 9"/>
                            <line x1="3" y1="12" x2="21" y2="12"/>
                        </svg>
                    </button>
                    <button @click="formatText('outdent')" class="toolbar-btn-simple group" title="减少缩进 (Shift+Tab)">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                            <line x1="12" y1="5" x2="12" y2="19"/>
                            <polyline points="16 15 12 19 8 15"/>
                            <line x1="3" y1="12" x2="21" y2="12"/>
                        </svg>
                    </button>
                    <button @click="formatText('bulletList')" class="toolbar-btn-simple group" title="项目符号列表">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                            <circle cx="8" cy="6" r="1"/>
                            <circle cx="8" cy="12" r="1"/>
                            <circle cx="8" cy="18" r="1"/>
                            <line x1="12" y1="6" x2="20" y2="6"/>
                            <line x1="12" y1="12" x2="20" y2="12"/>
                            <line x1="12" y1="18" x2="20" y2="18"/>
                        </svg>
                    </button>
                    <button @click="formatText('numberList')" class="toolbar-btn-simple group" title="编号列表">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                            <line x1="6" y1="6" x2="6" y2="18"/>
                            <path d="M10 6h10M10 12h10M10 18h10"/>
                            <path d="M3 6h1M3 12h1M3 18h1"/>
                        </svg>
                    </button>
                    
                    <div class="w-[1px] h-5 bg-gray-300 dark:bg-gray-700 mx-1"></div>
                    
                    <!-- 查找和替换 -->
                    <button @click="formatText('find')" class="toolbar-btn-simple group" title="查找 (Ctrl+F)">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                            <circle cx="11" cy="11" r="8"/>
                            <path d="M21 21l-4.35-4.35"/>
                        </svg>
                    </button>
                    <button @click="formatText('replace')" class="toolbar-btn-simple group" title="查找替换 (Ctrl+H)">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                            <path d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z"/>
                            <path d="M17 8l-4 4 4 4"/>
                        </svg>
                    </button>
                    
                    <div class="w-[1px] h-5 bg-gray-300 dark:bg-gray-700 mx-1"></div>
                    
                    <!-- 实用工具 -->
                    <button @click="insertDateTime" class="toolbar-btn-simple group" title="插入日期时间">
                        <Icon name="calendar" :size="16" color="currentColor" class="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200"/>
                    </button>
                    <button @click="insertLineBreak" class="toolbar-btn-simple group" title="插入换行">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                            <polyline points="9 10 3 4 9 2"/>
                            <polyline points="15 14 21 20 15 22"/>
                            <line x1="3" y1="4" x2="21" y2="20"/>
                        </svg>
                    </button>
                    <button @click="formatText('wordCount')" class="toolbar-btn-simple group" title="字数统计">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                            <polyline points="10 9 9 9 8 9"/>
                        </svg>
                    </button>
                </template>
            </div>

            <!-- 正文编辑区 -->
            <div class="flex-1 overflow-hidden relative min-h-0">
                <!-- Markdown 编辑器 - 左右分栏 -->
                <div v-if="currentArticle?.format === 'md'" class="h-full flex min-h-0">
                    <!-- 左侧：MD源码编辑区 -->
                    <div class="flex-1 flex flex-col min-w-0 border-r border-gray-200 dark:border-gray-800 transition-colors" :class="{ 'focus-mode': userStyle.focusMode }">
                        <div class="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                            <span class="text-xs font-bold text-gray-500 dark:text-gray-400">Markdown 源码</span>
                            <div class="flex items-center gap-2">
                                <button 
                                    v-if="userStyle.typewriterMode"
                                    class="text-xs text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded bg-indigo-50 dark:bg-indigo-900/20"
                                    title="打字机模式已开启"
                                >
                                    打字机
                                </button>
                                <button 
                                    @click="toggleMdSplit" 
                                    class="text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                    title="切换分栏/单栏模式"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                                        <line x1="12" y1="3" x2="12" y2="21"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div class="flex-1 overflow-hidden relative min-h-0" :class="{ 'md-editor-with-linenums': userStyle.showLineNumbers, 'typewriter-mode': userStyle.typewriterMode }">
                            <!-- 行号显示（参照VSCode样式） -->
                            <div 
                                v-if="userStyle.showLineNumbers" 
                                class="absolute left-0 top-0 bottom-0 w-14 bg-gray-50/80 dark:bg-gray-900/80 border-r border-gray-200 dark:border-gray-800 text-right text-xs font-mono select-none z-10 overflow-hidden line-numbers-container pointer-events-none"
                                ref="lineNumbersRef"
                            >
                                <div 
                                    v-for="n in lineCount" 
                                    :key="n"
                                    class="px-3 py-0 leading-[1.8] transition-colors"
                                    :class="isLineEmpty(n, true) ? 'text-gray-300 dark:text-gray-700' : 'text-gray-500 dark:text-gray-500'"
                                    :style="{ 
                                        fontFamily: 'Consolas, Monaco, monospace', 
                                        fontSize: '12px',
                                        lineHeight: '1.8'
                                    }"
                                >
                                    {{ n }}
                                </div>
                            </div>
                            <textarea 
                                id="my-easymde-editor"
                                v-model="mdSource"
                                @input="handleMdInput"
                                @scroll="syncLineNumbers"
                                @focus="handleEditorFocus('md')"
                                @blur="handleEditorBlur('md')"
                                @mousedown="handleEditorMouseDown('md')"
                                @click="handleEditorClick('md')"
                                @contextmenu.prevent="showEditorContextMenu($event, 'md')"
                                placeholder="在此处开始你的创作..."
                                class="w-full h-full border-none outline-none resize-none bg-transparent text-gray-700 dark:text-gray-200 transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-600 font-mono text-sm"
                                :class="userStyle.showLineNumbers ? 'pl-16 pr-6 py-6' : 'p-6'"
                                :style="{ 
                                    fontFamily: userStyle.fontFamily || 'inherit', 
                                    fontSize: userStyle.fontSize + 'px' || '18px',
                                    lineHeight: '1.8'
                                }"
                            ></textarea>
                        </div>
                    </div>
                    
                    <!-- 右侧：预览区 -->
                    <div 
                        v-show="!mdSplitHidden"
                        class="flex-1 flex flex-col min-w-0 bg-white dark:bg-black transition-all duration-300"
                    >
                        <div class="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                            <span class="text-xs font-bold text-gray-500 dark:text-gray-400">预览效果</span>
                            <button 
                                @click="mdSplitHidden = true" 
                                class="text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                title="隐藏预览"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        </div>
                        <div 
                            class="flex-1 overflow-y-auto p-6 prose prose-sm dark:prose-invert max-w-none custom-scrollbar markdown-preview min-h-0"
                            v-html="mdPreview"
                            :style="{ 
                                fontFamily: userStyle.fontFamily || 'inherit', 
                                fontSize: userStyle.fontSize + 'px' || '18px',
                                lineHeight: '1.8'
                            }"
                        ></div>
                    </div>
                </div>
                
                <!-- 纯文本编辑器 - 富文本编辑器（类似Word） -->
                <div v-else class="h-full flex flex-col min-h-0">
                    <div class="flex-1 overflow-hidden relative min-h-0" :class="{ 'text-editor-with-linenums': userStyle.showLineNumbers }">
                        <!-- 行号显示（参照VSCode样式） -->
                        <div 
                            v-if="userStyle.showLineNumbers" 
                            class="absolute left-0 top-0 bottom-0 w-14 bg-gray-50/80 dark:bg-gray-900/80 border-r border-gray-200 dark:border-gray-800 text-right text-xs font-mono select-none z-10 overflow-hidden line-numbers-container pointer-events-none"
                            ref="textLineNumbersRef"
                        >
                            <div 
                                v-for="n in textLineCount" 
                                :key="n"
                                class="px-3 py-0 leading-[1.8] transition-colors"
                                :class="isLineEmpty(n, false) ? 'text-gray-300 dark:text-gray-700' : 'text-gray-500 dark:text-gray-500'"
                                :style="{ 
                                    fontFamily: 'Consolas, Monaco, monospace', 
                                    fontSize: '12px',
                                    lineHeight: '1.8'
                                }"
                            >
                                {{ n }}
                            </div>
                        </div>
                        <div 
                            id="my-text-editor"
                            contenteditable="true"
                            @input="handleTextInput"
                            @paste="handlePaste"
                            @scroll="syncTextLineNumbers"
                            @focus="handleEditorFocus('text')"
                            @blur="handleEditorBlur('text')"
                            @mousedown="handleEditorMouseDown('text')"
                            @click="handleEditorClick('text')"
                            @contextmenu.prevent="showEditorContextMenu($event, 'text')"
                            data-placeholder="在此处开始你的创作..."
                            class="w-full h-full border-none outline-none resize-none bg-transparent text-gray-700 dark:text-gray-200 transition-colors overflow-y-auto custom-scrollbar rich-text-editor"
                            :class="userStyle.showLineNumbers ? 'pl-16 pr-6 py-6' : 'p-6'"
                            :style="{ 
                                fontFamily: userStyle.fontFamily || 'inherit', 
                                fontSize: userStyle.fontSize + 'px' || '18px',
                                lineHeight: '1.8'
                            }"
                        ></div>
                    </div>
                </div>
            </div>
            
            <div class="h-8 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between px-6 text-[10px] select-none bg-white/90 dark:bg-black/90 backdrop-blur font-mono transition-all duration-300">
                <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200" @click="showWordStats = true">
                    <ph-text-t :size="12" class="text-indigo-500 dark:text-indigo-400 transition-transform duration-200 hover:scale-110" />
                    <span class="font-bold">{{ characterCount }} 字符</span>
                </div>
                <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full animate-pulse shadow-sm transition-all duration-300" :class="statusIndicator"></span>
                    <span class="font-bold transition-colors duration-200" :class="statusTextClass">{{ statusText }}</span>
                </div>
            </div>
        </div>

        <div v-else class="flex-1 flex flex-col items-center justify-center text-gray-300 dark:text-gray-600 select-none bg-gray-50/30 dark:bg-black/30 transition-colors">
            <ph-pencil-slash :size="48" class="text-gray-200 dark:text-gray-800 mb-4 transition-colors" />
            <p class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-colors">请选择或创建文档</p>
        </div>
    </div>

    <div v-if="contextMenu.visible" 
         class="fixed z-[1000] bg-white dark:bg-black rounded-lg shadow-xl border border-gray-100 dark:border-gray-800 py-1 w-40 animate-fade-in transition-colors duration-300"
         :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
         @click.stop>
        <button @click="openRenameModal" class="w-full text-left px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-black dark:hover:text-white flex items-center gap-2 transition-colors">
            <ph-pencil-simple :size="14" /> 重命名
        </button>
        <button @click="openConvertModalFromMenu" class="w-full text-left px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-black dark:hover:text-white flex items-center gap-2 transition-colors">
            <ph-swap :size="14" /> 格式转换
        </button>
        <div class="h-px bg-gray-100 dark:bg-gray-800 my-1"></div>
        <button @click="openExportModal" class="w-full text-left px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-black dark:hover:text-white flex items-center gap-2 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            导出为...
        </button>
        <div class="h-px bg-gray-100 dark:bg-gray-800 my-1"></div>
        <button @click="deleteFromMenu" class="w-full text-left px-4 py-2 text-xs font-bold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors">
            <ph-trash :size="14" /> 删除
        </button>
    </div>

    <!-- 编辑器右键菜单 -->
    <div 
        v-if="editorContextMenuVisible" 
        class="fixed z-[300] bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-800 py-1 min-w-[160px] transition-all duration-200"
        :style="{ 
            left: editorContextMenuPos.x + 'px', 
            top: editorContextMenuPos.y + 'px' 
        }"
        @click.stop
        @contextmenu.prevent
    >
        <button 
            @click="handleEditorContextAction('cut')"
            class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-3 transition-colors"
        >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-600 dark:text-gray-400">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/>
            </svg>
            <span>剪切</span>
        </button>
        <button 
            @click="handleEditorContextAction('copy')"
            class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-3 transition-colors"
        >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-600 dark:text-gray-400">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            <span>复制</span>
        </button>
        <button 
            @click="handleEditorContextAction('paste')"
            class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-3 transition-colors"
        >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-600 dark:text-gray-400">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
            </svg>
            <span>粘贴</span>
        </button>
    </div>

    <transition name="modal">
    <div v-if="showRenameModal" class="fixed inset-0 z-[200] flex items-center justify-center bg-black/20 backdrop-blur-sm">
        <div class="bg-white dark:bg-black w-[300px] p-5 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 transition-all duration-300">
            <h3 class="font-bold text-gray-800 mb-4 text-sm">重命名文档</h3>
            <input v-model="renameTempTitle" @keyup.enter="confirmRename" class="w-full bg-gray-100 border-none rounded-lg px-3 py-2 text-sm outline-none mb-4 focus:ring-2 ring-indigo-500/20" placeholder="输入新名称" autofocus>
            <div class="flex gap-2">
                <button @click="showRenameModal = false" class="flex-1 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-xs font-bold">取消</button>
                <button @click="confirmRename" class="flex-1 py-2 bg-[#1d1d1f] text-white rounded-lg text-xs font-bold hover:opacity-90">确定</button>
            </div>
        </div>
    </div>
    </transition>

    <!-- 新建文档模态框 -->
    <transition name="modal">
    <div v-if="showCreateModal" class="fixed inset-0 z-[200] flex items-center justify-center bg-black/20 backdrop-blur-sm" @click.self="showCreateModal = false">
        <div class="bg-white dark:bg-black w-[420px] p-6 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 transition-all duration-300">
            <h3 class="font-bold text-gray-800 mb-6 flex items-center gap-2"><ph-file-plus :size="20" weight="bold"/> 新建文档</h3>
            
            <div class="mb-5">
                <label class="block text-xs font-bold text-gray-600 mb-2">文档名称</label>
                <input 
                    v-model="newDocTitle" 
                    @keyup.enter="confirmCreate"
                    class="w-full bg-gray-100 border-none rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 ring-indigo-500/20" 
                    placeholder="输入文档名称（可选）"
                    autofocus
                >
                <p class="text-[10px] text-gray-400 mt-1.5">留空将使用默认名称</p>
            </div>

            <div class="mb-6">
                <label class="block text-xs font-bold text-gray-600 mb-3">文档格式</label>
                <div class="grid grid-cols-2 gap-3">
                    <button 
                        @click="newDocFormat = 'md'"
                        class="py-3 rounded-xl border-2 font-bold text-xs transition-all flex flex-col items-center gap-1.5"
                        :class="newDocFormat === 'md' 
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                            : 'border-gray-200 hover:border-indigo-300 text-gray-700'"
                    >
                        <ph-file-code :size="24" />
                        <span>Markdown</span>
                    </button>
                    <button 
                        @click="newDocFormat = 'txt'"
                        class="py-3 rounded-xl border-2 font-bold text-xs transition-all flex flex-col items-center gap-1.5"
                        :class="newDocFormat === 'txt' 
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                            : 'border-gray-200 hover:border-indigo-300 text-gray-700'"
                    >
                        <ph-text-t :size="24" />
                        <span>纯文本</span>
                    </button>
                </div>
            </div>

            <div class="flex gap-2">
                <button @click="showCreateModal = false" class="flex-1 py-2.5 text-gray-500 hover:bg-gray-100 rounded-lg text-xs font-bold transition">取消</button>
                <button @click="confirmCreate" class="flex-1 py-2.5 bg-[#1d1d1f] text-white rounded-lg text-xs font-bold hover:opacity-90 transition">创建</button>
            </div>
        </div>
    </div>
    </transition>

    <!-- 字数统计弹窗 -->
    <transition name="modal">
      <div v-if="showWordStats" class="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm" @click.self="showWordStats = false">
        <div class="bg-white dark:bg-black rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 w-[500px] max-w-[90vw] transition-all duration-300">
          <div class="p-6 border-b border-gray-200 dark:border-gray-800">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">字数统计</h3>
              <button @click="showWordStats = false" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-200">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="p-6 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 transition-all duration-200 hover:shadow-md">
                <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">字符数（含空格）</div>
                <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ wordStatsComputed.chars }}</div>
              </div>
              <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 transition-all duration-200 hover:shadow-md">
                <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">字符数（不含空格）</div>
                <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ wordStatsComputed.charsNoSpaces }}</div>
              </div>
              <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 transition-all duration-200 hover:shadow-md">
                <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">总字数</div>
                <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ wordStatsComputed.words }}</div>
                <div class="text-[10px] text-gray-400 dark:text-gray-500 mt-1">中文+英文单词</div>
              </div>
              <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 transition-all duration-200 hover:shadow-md">
                <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">中文字符</div>
                <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ wordStatsComputed.chineseChars }}</div>
              </div>
              <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 transition-all duration-200 hover:shadow-md">
                <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">中文标点</div>
                <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ wordStatsComputed.chinesePunctuation }}</div>
              </div>
              <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 transition-all duration-200 hover:shadow-md">
                <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">英文单词</div>
                <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ wordStatsComputed.englishWords }}</div>
              </div>
              <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 transition-all duration-200 hover:shadow-md">
                <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">数字</div>
                <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ wordStatsComputed.numbers }}</div>
              </div>
              <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 transition-all duration-200 hover:shadow-md">
                <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">段落数</div>
                <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ wordStatsComputed.paragraphs }}</div>
              </div>
              <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 transition-all duration-200 hover:shadow-md">
                <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">行数</div>
                <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ wordStatsComputed.lines }}</div>
              </div>
              <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 transition-all duration-200 hover:shadow-md">
                <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">句子数</div>
                <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ wordStatsComputed.sentences }}</div>
              </div>
            </div>
          </div>
          <div class="p-6 border-t border-gray-200 dark:border-gray-800 flex justify-end">
            <button @click="showWordStats = false" class="px-6 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 dark:hover:bg-indigo-400 transition-all duration-200 hover:scale-105 active:scale-95">
              关闭
            </button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="modal">
    <div v-if="showConvertModal" class="fixed inset-0 z-[200] flex items-center justify-center bg-black/20 dark:bg-black/60 backdrop-blur-sm" @click.self="showConvertModal = false">
         <div class="bg-white dark:bg-black w-[400px] p-6 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 transition-colors duration-300">
            <h3 class="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2 transition-colors"><ph-swap :size="20"/> 格式转换</h3>
            <p v-if="currentArticle" class="text-xs text-gray-500 dark:text-gray-400 mb-4 transition-colors">当前格式: <span class="font-bold text-indigo-600 dark:text-indigo-400">{{ currentArticle.format.toUpperCase() }}</span></p>
            <div class="grid grid-cols-3 gap-3 mb-6">
                <button 
                    v-for="fmt in ['md', 'txt', 'json']" 
                    :key="fmt" 
                    @click="convertFormat(fmt)" 
                    :disabled="currentArticle?.format === fmt"
                    class="py-3 rounded-xl border font-bold uppercase text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    :class="currentArticle?.format === fmt 
                        ? 'border-gray-300 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 text-gray-400 dark:text-gray-500' 
                        : 'border-gray-200 dark:border-gray-800 hover:border-indigo-500 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-700 dark:hover:text-indigo-400 text-gray-700 dark:text-gray-300'"
                >{{ fmt }}</button>
            </div>
            <button @click="showConvertModal = false" class="w-full py-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-xs font-bold transition-colors">取消</button>
        </div>
    </div>
    </transition>

    <!-- 导出模态框 -->
    <transition name="fade">
        <div v-if="showExportModal" class="fixed inset-0 z-[200] flex items-center justify-center bg-black/20 dark:bg-black/60 backdrop-blur-sm" @click.self="showExportModal = false">
            <div class="bg-white dark:bg-black w-[420px] p-6 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 transition-colors duration-300">
                <h3 class="font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2 transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    导出文档
                </h3>
                
                <div class="mb-6">
                    <label class="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-3 transition-colors">选择导出格式</label>
                    <div class="grid grid-cols-3 gap-3">
                        <button
                            @click="selectedExportFormat = 'txt'"
                            class="p-4 rounded-xl border-2 transition-all duration-300 text-left"
                            :class="selectedExportFormat === 'txt' 
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                                : 'border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700'"
                        >
                            <div class="flex items-center gap-2 mb-2">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-700 dark:text-gray-300">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                    <polyline points="14 2 14 8 20 8"/>
                                </svg>
                                <span class="text-sm font-bold text-gray-800 dark:text-white">TXT</span>
                            </div>
                            <p class="text-[10px] text-gray-500 dark:text-gray-400">纯文本格式</p>
                        </button>
                        
                        <button
                            @click="selectedExportFormat = 'json'"
                            class="p-4 rounded-xl border-2 transition-all duration-300 text-left"
                            :class="selectedExportFormat === 'json' 
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                                : 'border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700'"
                        >
                            <div class="flex items-center gap-2 mb-2">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-700 dark:text-gray-300">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                    <polyline points="14 2 14 8 20 8"/>
                                </svg>
                                <span class="text-sm font-bold text-gray-800 dark:text-white">JSON</span>
                            </div>
                            <p class="text-[10px] text-gray-500 dark:text-gray-400">包含元数据</p>
                        </button>
                        
                        <button
                            @click="selectedExportFormat = 'docx'"
                            class="p-4 rounded-xl border-2 transition-all duration-300 text-left"
                            :class="selectedExportFormat === 'docx' 
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                                : 'border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700'"
                        >
                            <div class="flex items-center gap-2 mb-2">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-700 dark:text-gray-300">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                    <polyline points="14 2 14 8 20 8"/>
                                    <line x1="16" y1="13" x2="8" y2="13"/>
                                    <line x1="16" y1="17" x2="8" y2="17"/>
                                </svg>
                                <span class="text-sm font-bold text-gray-800 dark:text-white">DOCX</span>
                            </div>
                            <p class="text-[10px] text-gray-500 dark:text-gray-400">Word文档</p>
                        </button>
                    </div>
                </div>
                
                <div class="flex gap-2">
                    <button @click="showExportModal = false" class="flex-1 py-2.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg text-xs font-bold transition">取消</button>
                    <button @click="confirmExport" class="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition">导出</button>
                </div>
            </div>
        </div>
    </transition>

    <!-- 自定义确认对话框 -->
    <transition name="fade">
        <div v-if="confirmDialog.visible" class="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm" @click.self="confirmDialog.visible = false">
            <div class="bg-white dark:bg-black w-[420px] p-6 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 transition-colors duration-300 select-none">
                <div class="flex items-center gap-3 mb-4">
                    <div class="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-red-600 dark:text-red-400">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                    </div>
                    <h3 class="text-lg font-bold text-gray-800 dark:text-white transition-colors">{{ confirmDialog.title || '确认操作' }}</h3>
                </div>
                
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-6 transition-colors">{{ confirmDialog.message }}</p>
                
                <div v-if="confirmDialog.showCheckbox" class="mb-6">
                    <label class="flex items-center gap-2 cursor-pointer group">
                        <input 
                            type="checkbox" 
                            v-model="confirmDialog.checkboxChecked"
                            class="w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-800 dark:checked:bg-indigo-600 cursor-pointer"
                        >
                        <span class="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">{{ confirmDialog.checkboxLabel }}</span>
                    </label>
                </div>
                
                <div class="flex gap-3">
                    <button 
                        @click="handleConfirmCancel" 
                        class="flex-1 py-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg text-sm font-bold transition"
                    >
                        取消
                    </button>
                    <button 
                        @click="handleConfirmOk" 
                        class="flex-1 py-2.5 bg-red-600 dark:bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-700 dark:hover:bg-red-400 transition"
                    >
                        {{ confirmDialog.okText || '确定' }}
                    </button>
                </div>
            </div>
        </div>
    </transition>

    <!-- 自定义提示框 -->
    <transition name="fade">
        <div v-if="alertDialog.visible" class="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm" @click.self="alertDialog.visible = false">
            <div class="bg-white dark:bg-black w-[420px] p-6 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 transition-colors duration-300 select-none">
                <div class="flex items-center gap-3 mb-4">
                    <div class="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-indigo-600 dark:text-indigo-400">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="16" x2="12" y2="12"/>
                            <line x1="12" y1="8" x2="12.01" y2="8"/>
                        </svg>
                    </div>
                    <h3 class="text-lg font-bold text-gray-800 dark:text-white transition-colors">{{ alertDialog.title || '提示' }}</h3>
                </div>
                
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-6 transition-colors">{{ alertDialog.message }}</p>
                
                <div class="flex justify-end">
                    <button 
                        @click="alertDialog.visible = false" 
                        class="px-6 py-2.5 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 dark:hover:bg-indigo-400 transition"
                    >
                        确定
                    </button>
                </div>
            </div>
        </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive, nextTick, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
import DynamicIsland from '../components/DynamicIsland.vue';
import Icon from '../components/Icon.vue';
import { useTheme } from '../composables/useTheme';
import { useWordCount } from '../composables/useWordCount';
import dayjs from 'dayjs';
import MarkdownIt from 'markdown-it';

// 初始化Markdown渲染器
const mdRenderer = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: true
});

const router = useRouter();
const articles = ref([]);
const currentArticle = ref(null);
const content = ref('');
const mdSource = ref(''); // MD源码
const appStatus = ref('Ready');
const userStyle = reactive({ 
    fontFamily: 'inherit', 
    fontSize: '18px', 
    showRawMd: false,
    showLineNumbers: false,
    typewriterMode: false,
    focusMode: false,
    sourceMode: false
});
const defaultFormat = ref('md');
let saveTimer = null;

// MD编辑器状态
const mdSplitHidden = ref(false); // 是否隐藏预览栏
const lineNumbersRef = ref(null);
const textLineNumbersRef = ref(null);

// 计算行号数量（参照VSCode：只显示有内容的行，空行也显示但样式不同）
const lineCount = computed(() => {
    if (!mdSource.value) return 1;
    const lines = mdSource.value.split('\n');
    // 返回实际行数（包括空行）
    return Math.max(1, lines.length);
});

const textLineCount = computed(() => {
    const editor = document.getElementById('my-text-editor');
    if (!editor) return 1;
    const text = editor.textContent || editor.innerText || '';
    // 计算换行数（包括空行）
    const lines = text.split('\n');
    return Math.max(1, lines.length);
});

// 检查某行是否为空（用于行号样式）
const isLineEmpty = (lineIndex, isMd = true) => {
    if (isMd) {
        const lines = mdSource.value.split('\n');
        return !lines[lineIndex - 1] || lines[lineIndex - 1].trim() === '';
    } else {
        const editor = document.getElementById('my-text-editor');
        if (!editor) return true;
        const text = editor.textContent || editor.innerText || '';
        const lines = text.split('\n');
        return !lines[lineIndex - 1] || lines[lineIndex - 1].trim() === '';
    }
};

// 同步行号滚动
const syncLineNumbers = () => {
    if (!userStyle.showLineNumbers || !lineNumbersRef.value) return;
    const textarea = document.getElementById('my-easymde-editor');
    if (!textarea) return;
    if (lineNumbersRef.value) {
        lineNumbersRef.value.scrollTop = textarea.scrollTop;
    }
};

const syncTextLineNumbers = () => {
    if (!userStyle.showLineNumbers || !textLineNumbersRef.value) return;
    const editor = document.getElementById('my-text-editor');
    if (!editor) return;
    if (textLineNumbersRef.value) {
        textLineNumbersRef.value.scrollTop = editor.scrollTop;
    }
};

// MD预览内容
const mdPreview = computed(() => {
    if (!mdRenderer || !mdSource.value) return '';
    try {
        return mdRenderer.render(mdSource.value);
    } catch (e) {
        console.error('Markdown render error:', e);
        return mdSource.value.replace(/\n/g, '<br>');
    }
});

const sidebarTab = ref('docs');
const showConvertModal = ref(false);
const showCreateModal = ref(false);
const showWordStats = ref(false);
const snapshots = ref([]);

// 新建文档相关
const newDocTitle = ref('');
const newDocFormat = ref('md');

// 右键菜单状态
const contextMenu = reactive({ visible: false, x: 0, y: 0, item: null });
const showRenameModal = ref(false);
const renameTempTitle = ref('');
const showExportModal = ref(false);
const selectedExportFormat = ref('txt');
const exportTargetItem = ref(null); // 保存导出目标项

// 自定义确认对话框状态
const confirmDialog = reactive({
    visible: false,
    title: '',
    message: '',
    okText: '确定',
    showCheckbox: false,
    checkboxLabel: '',
    checkboxChecked: false,
    onConfirm: null,
    onCancel: null
});

// 自定义提示框状态
const alertDialog = reactive({
    visible: false,
    title: '',
    message: ''
});

// 显示确认对话框
const showConfirm = (options) => {
    return new Promise((resolve) => {
        confirmDialog.title = options.title || '确认操作';
        confirmDialog.message = options.message || '';
        confirmDialog.okText = options.okText || '确定';
        confirmDialog.showCheckbox = options.showCheckbox || false;
        confirmDialog.checkboxLabel = options.checkboxLabel || '';
        confirmDialog.checkboxChecked = options.checkboxChecked !== undefined ? options.checkboxChecked : false;
        confirmDialog.onConfirm = () => {
            confirmDialog.visible = false;
            resolve({ confirmed: true, checkboxChecked: confirmDialog.checkboxChecked });
        };
        confirmDialog.onCancel = () => {
            confirmDialog.visible = false;
            resolve({ confirmed: false, checkboxChecked: false });
        };
        confirmDialog.visible = true;
    });
};

// 显示提示框
const showAlert = (message, title = '提示') => {
    return new Promise((resolve) => {
        alertDialog.title = title;
        alertDialog.message = message;
        alertDialog.visible = true;
        // 监听关闭事件
        const unwatch = watch(() => alertDialog.visible, (visible) => {
            if (!visible) {
                unwatch();
                resolve();
            }
        });
    });
};

// 处理确认对话框确定
const handleConfirmOk = () => {
    if (confirmDialog.onConfirm) {
        confirmDialog.onConfirm();
    }
};

// 处理确认对话框取消
const handleConfirmCancel = () => {
    if (confirmDialog.onCancel) {
        confirmDialog.onCancel();
    }
};

// 编辑器右键菜单状态
const editorContextMenuVisible = ref(false);
const editorContextMenuPos = ref({ x: 0, y: 0 });
const editorContextMenuType = ref('md'); // 'md' or 'text'

const { initTheme } = useTheme();

// 使用字符统计模块
const { characterCount, wordStats: wordStatsComputed, updateText, startTextUpdate, stopTextUpdate } = useWordCount(
    () => currentArticle.value,
    () => mdSource.value,
    () => content.value
);

onMounted(async () => {
  // 初始化主题
  await initTheme();
  
  // 监听窗口大小变化，临时禁用CSS过渡以避免闪屏
  const rootElement = document.documentElement;
  let resizeTimeout = null;
  
  window.api.onWindowResizingStart(() => {
    // 窗口开始resize时，立即添加类来禁用过渡
    rootElement.classList.add('no-transitions');
    // 强制重排，确保样式立即生效
    void rootElement.offsetHeight;
  });
  
  window.api.onWindowResizingEnd(() => {
    // 窗口resize结束后，延迟恢复过渡
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      rootElement.classList.remove('no-transitions');
      // 强制重排，确保样式立即生效
      void rootElement.offsetHeight;
    }, 150);
  });
  
  const settings = await window.api.getSettings();
  Object.assign(userStyle, settings);
  window.api.onSettingsUpdated((s) => {
    const oldShowRawMd = userStyle.showRawMd;
    const oldSourceMode = userStyle.sourceMode;
    const oldTypewriterMode = userStyle.typewriterMode;
    const oldFocusMode = userStyle.focusMode;
    
    Object.assign(userStyle, s);
    
    // 如果主题改变，更新主题
    if (s.theme) {
      const { applyTheme } = useTheme();
      applyTheme(s.theme);
    }
    
    // showRawMd 设置现在用于控制是否显示预览栏（在左右分栏模式下）
    // 如果 showRawMd = true，只显示源码；如果 false，显示左右分栏
    if (s.showRawMd !== undefined && currentArticle.value?.format === 'md') {
      mdSplitHidden.value = s.showRawMd; // true = 隐藏预览（只显示源码），false = 显示分栏
    }
    
    // 源代码模式：隐藏预览，只显示源码
    if (s.sourceMode !== undefined && s.sourceMode !== oldSourceMode && currentArticle.value?.format === 'md') {
      mdSplitHidden.value = s.sourceMode;
    }
    
    // 打字机模式和专注模式需要重新初始化编辑器
    if ((s.typewriterMode !== undefined && s.typewriterMode !== oldTypewriterMode) || 
        (s.focusMode !== undefined && s.focusMode !== oldFocusMode)) {
      nextTick(() => {
        initEditor();
      });
    }
    
    // 行号显示变化时，需要更新行号
    if (s.showLineNumbers !== undefined) {
      nextTick(() => {
        syncLineNumbers();
        syncTextLineNumbers();
      });
    }
  });
  defaultFormat.value = await window.api.getDefaultFormat();
  await refreshList();
  
  // 启动字符统计更新
  startTextUpdate();
});

// 全局点击处理 - 关闭右键菜单
const handleGlobalClick = (event) => {
    // 如果点击的不是右键菜单本身，则关闭菜单
    if (contextMenu.visible && !event.target.closest('.fixed.z-\\[1000\\]')) {
        closeContextMenu();
    }
    if (editorContextMenuVisible.value && !event.target.closest('.fixed.z-\\[300\\]')) {
        closeEditorContextMenu();
    }
};

// 右键菜单逻辑
const showContext = (event, item) => {
    event.stopPropagation();
    contextMenu.visible = true;
    contextMenu.x = event.clientX;
    contextMenu.y = event.clientY;
    contextMenu.item = item;
};
const closeContextMenu = () => { 
    contextMenu.visible = false;
    contextMenu.item = null;
};

// 保存删除目标项
const deleteTargetItem = ref(null);

const deleteFromMenu = async () => {
    if (!contextMenu.item) {
        closeContextMenu();
        return;
    }
    
    // 保存引用，防止关闭菜单后丢失
    deleteTargetItem.value = contextMenu.item;
    closeContextMenu();
    
    const result = await showConfirm({
        title: '删除文档',
        message: `确定要删除 "${deleteTargetItem.value.title}" 吗？此操作无法撤销。`,
        okText: '删除',
        showCheckbox: true,
        checkboxLabel: '同时删除文件',
        checkboxChecked: true
    });
    
    if (result.confirmed && deleteTargetItem.value) {
        await window.api.deleteArticle(deleteTargetItem.value.id, result.checkboxChecked);
        if (currentArticle.value?.id === deleteTargetItem.value.id) {
            currentArticle.value = null;
            content.value = '';
            mdSource.value = '';
        }
        await refreshList();
        appStatus.value = '已删除';
        setTimeout(() => {
            if (appStatus.value === '已删除') appStatus.value = 'Ready';
        }, 2000);
    }
    
    // 清理引用
    deleteTargetItem.value = null;
};

// 打开导出模态框
const openExportModal = () => {
    if (!contextMenu.item) {
        closeContextMenu();
        return;
    }
    exportTargetItem.value = contextMenu.item; // 保存引用
    selectedExportFormat.value = 'txt'; // 默认选择TXT
    showExportModal.value = true;
    closeContextMenu();
};

// 确认导出
const confirmExport = async () => {
    const articleId = exportTargetItem.value?.id || currentArticle.value?.id;
    if (!articleId) {
        showExportModal.value = false;
        exportTargetItem.value = null; // 清理
        return;
    }
    
    showExportModal.value = false;
    
    try {
        const result = await window.api.exportArticle(articleId, selectedExportFormat.value);
        if (result.success) {
            appStatus.value = '已导出';
            setTimeout(() => {
                if (appStatus.value === '已导出') appStatus.value = 'Ready';
            }, 2000);
        } else if (!result.canceled) {
            await showAlert('导出失败: ' + (result.error || '未知错误'), '导出失败');
        }
        exportTargetItem.value = null; // 清理
    } catch (e) {
        console.error('Export error:', e);
        await showAlert('导出失败: ' + (e.message || '未知错误'), '导出失败');
        exportTargetItem.value = null; // 清理
    }
};

// 保存右键菜单项，防止关闭后丢失
const renameTargetItem = ref(null);

const openRenameModal = () => {
    if (!contextMenu.item) {
        closeContextMenu();
        return;
    }
    renameTargetItem.value = contextMenu.item; // 保存引用
    renameTempTitle.value = contextMenu.item.title;
    showRenameModal.value = true;
    closeContextMenu();
};

const confirmRename = async () => {
    if (!renameTempTitle.value.trim() || !renameTargetItem.value) return;
    const res = await window.api.renameArticle(renameTargetItem.value.id, renameTempTitle.value);
    if (res.success) {
        // 如果正在编辑当前文档，更新标题
        if (currentArticle.value?.id === renameTargetItem.value.id) {
            currentArticle.value.title = res.newTitle;
        }
        await refreshList();
        showRenameModal.value = false;
        renameTargetItem.value = null; // 清理
    } else {
        await showAlert('重命名失败: ' + res.error, '重命名失败');
    }
};

// ... (以下保持之前的 refreshList, createNew, loadArticle, initEditor, handleInput 等核心逻辑) ...
// 为了代码简洁，请将上一步中提供的完整逻辑复制到这里。
// 核心逻辑包括：initEditor, loadArticle, handleInput, performSave, insertMD 等
const refreshList = async () => { articles.value = await window.api.getArticles(); };
const switchSidebarToHistory = async () => {
    sidebarTab.value = 'history';
    await loadSnapshots();
};

const loadSnapshots = async () => {
    if(currentArticle.value) {
        snapshots.value = await window.api.getSnapshots(currentArticle.value.id);
    } else {
        snapshots.value = [];
    }
};
const createNew = () => {
  newDocTitle.value = '';
  newDocFormat.value = defaultFormat.value || 'md';
  showCreateModal.value = true;
};

// 打开外部文件
const openExternalFile = async () => {
  try {
    const result = await window.api.openExternalFile();
    if (result.success) {
      // 刷新列表
      await refreshList();
      // 查找并加载新打开的文件
      const newArticle = articles.value.find(a => a.id === result.articleId);
      if (newArticle) {
        await loadArticle(newArticle);
        appStatus.value = '已打开';
        setTimeout(() => {
          if (appStatus.value === '已打开') appStatus.value = 'Ready';
        }, 2000);
      }
    } else if (!result.canceled) {
      await showAlert('打开文件失败: ' + (result.error || '未知错误'), '打开失败');
    }
  } catch (e) {
    console.error('Open external file error:', e);
    await showAlert('打开文件失败: ' + (e.message || '未知错误'), '打开失败');
  }
};

const confirmCreate = async () => {
  try {
    // 停止当前文章的临时文件缓存（如果有）
    if (currentArticle.value) {
      try {
        await window.api.stopArticleCache(currentArticle.value.id, currentArticle.value.path);
      } catch (e) {
        console.error('Failed to stop article cache:', e);
      }
    }
    
    // 如果用户没有输入标题，传递空字符串，后端会使用默认命名
    const title = newDocTitle.value.trim();
    const format = newDocFormat.value || defaultFormat.value || 'md';
    const newArt = await window.api.createArticle(title, format);
    showCreateModal.value = false;
    await refreshList();
    const created = articles.value.find(a => a.id === newArt.id);
    if (created) await loadArticle(created);
  } catch(e) {
    await showAlert('创建文档失败: ' + (e.message || '未知错误'), '创建失败');
  }
};
// MD输入处理
const handleMdInput = () => {
    content.value = mdSource.value;
    handleInput();
    
    // 更新字符统计
    updateText();
    
    // 更新行号（如果启用）
    if (userStyle.showLineNumbers) {
        nextTick(() => {
            syncLineNumbers();
        });
    }
    
    // 打字机模式：实时调整滚动位置
    if (userStyle.typewriterMode) {
        nextTick(() => {
            const textarea = document.getElementById('my-easymde-editor');
            if (textarea) {
                const lineHeight = parseFloat(userStyle.fontSize || 18) * 1.8;
                const textareaHeight = textarea.clientHeight;
                const cursorPos = textarea.selectionStart;
                const textBeforeCursor = textarea.value.substring(0, cursorPos);
                const cursorLine = textBeforeCursor.split('\n').length;
                const targetScroll = (cursorLine - 1) * lineHeight - (textareaHeight / 2) + (lineHeight / 2);
                textarea.scrollTop = Math.max(0, targetScroll);
            }
        });
    }
    
    // 专注模式：更新当前行标记
    if (userStyle.focusMode) {
        nextTick(() => {
            const textarea = document.getElementById('my-easymde-editor');
            if (textarea) {
                const cursorPos = textarea.selectionStart;
                const textBeforeCursor = textarea.value.substring(0, cursorPos);
                const currentLine = textBeforeCursor.split('\n').length;
                textarea.setAttribute('data-current-line', currentLine);
            }
        });
    }
};

// 切换MD分栏显示
const toggleMdSplit = () => {
    mdSplitHidden.value = !mdSplitHidden.value;
};

// 文本编辑器输入处理
const handleTextInput = (event) => {
    const editor = event.target;
    const html = editor.innerHTML;
    // 保存HTML格式（富文本）
    content.value = html;
    
    // 更新字符统计
    updateText();
    
    // 更新占位符状态
    if (html.trim() === '' || html === '<br>') {
        editor.classList.add('empty');
    } else {
        editor.classList.remove('empty');
    }
    
    handleInput();
    
    // 更新行号（如果启用）
    if (userStyle.showLineNumbers) {
        nextTick(() => {
            syncTextLineNumbers();
        });
    }
};

// 处理粘贴事件（清理格式）
const handlePaste = (event) => {
    event.preventDefault();
    const text = event.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
};

// 编辑器焦点和选中处理函数
const handleEditorFocus = (type) => {
    // 确保编辑器获得焦点后可以正常选中
    nextTick(() => {
        if (type === 'md') {
            const textarea = document.getElementById('my-easymde-editor');
            if (textarea && document.activeElement !== textarea) {
                textarea.focus();
            }
        } else {
            const editor = document.getElementById('my-text-editor');
            if (editor && document.activeElement !== editor) {
                editor.focus();
            }
        }
    });
};

const handleEditorBlur = (type) => {
    // 失去焦点时的处理（如果需要）
};

const handleEditorMouseDown = (type) => {
    // 确保鼠标点击时编辑器可以获得焦点
    if (type === 'md') {
        const textarea = document.getElementById('my-easymde-editor');
        if (textarea) {
            // 延迟一下确保焦点设置成功
            setTimeout(() => {
                if (document.activeElement !== textarea) {
                    textarea.focus();
                }
            }, 0);
        }
    } else {
        const editor = document.getElementById('my-text-editor');
        if (editor) {
            setTimeout(() => {
                if (document.activeElement !== editor) {
                    editor.focus();
                }
            }, 0);
        }
    }
};

const handleEditorClick = (type) => {
    // 点击时确保光标正常
    if (type === 'md') {
        const textarea = document.getElementById('my-easymde-editor');
        if (textarea) {
            // 如果点击时没有选中，将光标移到点击位置
            setTimeout(() => {
                if (textarea.selectionStart === textarea.selectionEnd) {
                    // 光标正常，不需要处理
                }
            }, 10);
        }
    } else {
        const editor = document.getElementById('my-text-editor');
        if (editor) {
            // 确保contenteditable元素可以正常选中
            const selection = window.getSelection();
            if (selection.rangeCount === 0) {
                const range = document.createRange();
                range.selectNodeContents(editor);
                range.collapse(false);
                selection.addRange(range);
            }
        }
    }
};

const initEditor = () => {
    // Markdown格式：使用左右分栏编辑器
    if (currentArticle.value?.format === 'md') {
        mdSource.value = content.value;
        nextTick(() => {
            // 更新字符统计
            updateText();
            
            const textarea = document.getElementById('my-easymde-editor');
            if (textarea) {
                // 使用setTimeout确保DOM完全渲染后再设置焦点
                setTimeout(() => {
                    textarea.focus();
                    // 确保光标在末尾
                    const len = textarea.value.length;
                    textarea.setSelectionRange(len, len);
                }, 50);
                
                // 打字机模式：将当前行保持在屏幕中央（类似Typora）
                if (userStyle.typewriterMode) {
                    const handleTypewriterScroll = () => {
                        requestAnimationFrame(() => {
                            const lineHeight = parseFloat(userStyle.fontSize || 18) * 1.8;
                            const textareaHeight = textarea.clientHeight;
                            const cursorPos = textarea.selectionStart;
                            const textBeforeCursor = textarea.value.substring(0, cursorPos);
                            const cursorLine = textBeforeCursor.split('\n').length;
                            const targetScroll = (cursorLine - 1) * lineHeight - (textareaHeight / 2) + (lineHeight / 2);
                            textarea.scrollTop = Math.max(0, targetScroll);
                        });
                    };
                    
                    textarea.addEventListener('input', handleTypewriterScroll);
                    textarea.addEventListener('click', handleTypewriterScroll);
                    textarea.addEventListener('keyup', handleTypewriterScroll);
                    textarea.addEventListener('keydown', (e) => {
                        // 处理方向键
                        if (['ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(e.key)) {
                            setTimeout(handleTypewriterScroll, 10);
                        }
                    });
                }
                
                // 专注模式：淡化其他行（类似Typora）
                if (userStyle.focusMode) {
                    const handleFocusMode = () => {
                        requestAnimationFrame(() => {
                            const cursorPos = textarea.selectionStart;
                            const textBeforeCursor = textarea.value.substring(0, cursorPos);
                            const currentLine = textBeforeCursor.split('\n').length;
                            const totalLines = textarea.value.split('\n').length;
                            
                            // 计算当前行在屏幕中的位置
                            const lineHeight = parseFloat(userStyle.fontSize || 18) * 1.8;
                            const textareaHeight = textarea.clientHeight;
                            const currentLineTop = (currentLine - 1) * lineHeight;
                            const scrollTop = textarea.scrollTop;
                            const viewportTop = scrollTop;
                            const viewportBottom = scrollTop + textareaHeight;
                            
                            // 如果当前行在视口中央附近，应用淡化效果
                            const lineCenter = currentLineTop + (lineHeight / 2);
                            const viewportCenter = viewportTop + (textareaHeight / 2);
                            
                            if (Math.abs(lineCenter - viewportCenter) < lineHeight * 2) {
                                textarea.classList.add('focus-active-line');
                            } else {
                                textarea.classList.remove('focus-active-line');
                            }
                            
                            textarea.setAttribute('data-current-line', currentLine);
                        });
                    };
                    
                    textarea.addEventListener('input', handleFocusMode);
                    textarea.addEventListener('click', handleFocusMode);
                    textarea.addEventListener('keyup', handleFocusMode);
                    textarea.addEventListener('scroll', handleFocusMode);
                }
                
                // 源代码模式：隐藏预览
                if (userStyle.sourceMode) {
                    mdSplitHidden.value = true;
                }
                
                // 同步滚动（可选功能）
                if (!mdSplitHidden.value) {
                    textarea.addEventListener('scroll', () => {
                        const preview = document.querySelector('.markdown-preview');
                        if (preview) {
                            const scrollPercent = textarea.scrollTop / (textarea.scrollHeight - textarea.clientHeight);
                            preview.scrollTop = scrollPercent * (preview.scrollHeight - preview.clientHeight);
                        }
                    });
                }
                
                // 同步行号滚动
                if (userStyle.showLineNumbers) {
                    textarea.addEventListener('scroll', syncLineNumbers);
                }
            }
        });
    } else {
        // 纯文本格式：使用富文本编辑器
        nextTick(() => {
            // 更新字符统计
            updateText();
            
            const editor = document.getElementById('my-text-editor');
            if (editor) {
                // 如果是HTML格式，直接设置；否则作为纯文本
                if (content.value && content.value.trim().startsWith('<')) {
                    editor.innerHTML = content.value;
                } else {
                    // 纯文本转换为HTML（保留换行）
                    editor.innerHTML = (content.value || '').replace(/\n/g, '<br>');
                }
                // 设置占位符
                if (!content.value || content.value.trim() === '') {
                    editor.classList.add('empty');
                } else {
                    editor.classList.remove('empty');
                }
                editor.focus();
                
                // 同步行号滚动
                if (userStyle.showLineNumbers) {
                    editor.addEventListener('scroll', syncTextLineNumbers);
                }
            }
        });
    }
};
const loadArticle = async (article) => {
  // 停止当前文章的临时文件缓存定时器
  if (currentArticle.value) {
    // 清除前端定时器
    if (tempCacheTimer) {
      clearInterval(tempCacheTimer);
      tempCacheTimer = null;
    }
    
    // 同步临时文件到正式文件并删除临时文件
    try {
      await window.api.stopArticleCache(currentArticle.value.id, currentArticle.value.path);
    } catch (e) {
      console.error('Failed to stop article cache:', e);
    }
  }
  
  // 保存当前文档（如果有）
  if (saveTimer) { 
    clearTimeout(saveTimer); 
    await performSave(); 
  }
  
  // 停止字符统计更新
  stopTextUpdate();
  
  // 加载新文章
  currentArticle.value = article;
  const loadedContent = await window.api.getArticleContent(article.id);
  content.value = loadedContent;
  
  // 重置MD编辑器状态
  if (article.format === 'md') {
    mdSource.value = loadedContent;
    mdSplitHidden.value = false; // 默认显示分栏
  }
  
  // 更新字符统计
  await nextTick();
  updateText();
  startTextUpdate();
  
  // 启动新文章的临时文件缓存定时器（1分钟保存一次到临时文件）
  if (article.path) {
    try {
      await window.api.startArticleCache(article.id, article.path);
      
      // 清除旧的定时器
      if (tempCacheTimer) {
        clearInterval(tempCacheTimer);
      }
      
      // 启动新的定时器：每1分钟保存到临时文件
      tempCacheTimer = setInterval(() => {
        if (currentArticle.value && currentArticle.value.id === article.id) {
          let saveContent = content.value;
          if (currentArticle.value.format === 'md') {
            saveContent = mdSource.value;
          } else {
            const editor = document.getElementById('my-text-editor');
            if (editor) {
              saveContent = editor.innerHTML;
            }
          }
          
          // 异步保存到临时文件（不阻塞）
          window.api.saveArticle(currentArticle.value.id, saveContent, currentArticle.value.title, false).catch(err => {
            console.error('Temp cache save failed:', err);
          });
        }
      }, TEMP_CACHE_INTERVAL);
    } catch (e) {
      console.error('Failed to start article cache:', e);
    }
  }
  
  if (sidebarTab.value === 'history') await loadSnapshots();
  appStatus.value = 'Ready';
  await nextTick();
  initEditor();
};
// 临时文件缓存定时器（1分钟保存一次到临时文件）
let tempCacheTimer = null;
const TEMP_CACHE_INTERVAL = 60000; // 1分钟

const handleInput = () => {
  appStatus.value = 'Writing';
  
  // 清除旧的最终保存定时器
  if (saveTimer) clearTimeout(saveTimer);
  
  // 2秒后执行最终保存（同步到正式文件和数据库）
  saveTimer = setTimeout(async () => { await performSave(); }, 2000);
  
  // 更新字数统计
  if (currentArticle.value?.format === 'md') {
    content.value = mdSource.value;
  }
};
const performSave = async () => {
  if (currentArticle.value) {
    // 根据格式获取内容
    let saveContent = content.value;
    if (currentArticle.value.format === 'md') {
      saveContent = mdSource.value;
    } else {
      // 富文本编辑器：保存HTML
      const editor = document.getElementById('my-text-editor');
      if (editor) {
        saveContent = editor.innerHTML;
      }
    }
    
    // 最终保存：同步临时文件到正式文件并删除临时文件
    await window.api.saveArticle(currentArticle.value.id, saveContent, currentArticle.value.title, true);
    await refreshList();
    if (sidebarTab.value === 'history') await loadSnapshots();
    appStatus.value = 'Saved';
    saveTimer = null;
    setTimeout(() => { if (appStatus.value === 'Saved') appStatus.value = 'Ready'; }, 2000);
  }
};
// 通用的文本插入函数，支持 Markdown 和纯文本编辑器
const insertText = (prefix, suffixOrOffset = '') => {
    if (currentArticle.value?.format === 'md') {
        // Markdown 编辑器 - 使用textarea
        const textarea = document.getElementById('my-easymde-editor');
        if (!textarea) return;
        
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = mdSource.value.substring(start, end);
        
        let newText = '';
        let newCursorPos = start;
        
        if (typeof suffixOrOffset === 'string') {
            newText = mdSource.value.substring(0, start) + prefix + selectedText + suffixOrOffset + mdSource.value.substring(end);
            // 如果有选中文本，光标移到后缀之后；如果没有选中文本，光标移到前缀和后缀之间
            if (selectedText) {
                newCursorPos = start + prefix.length + selectedText.length + suffixOrOffset.length;
            } else {
                newCursorPos = start + prefix.length;
            }
        } else if (typeof suffixOrOffset === 'number') {
            newText = mdSource.value.substring(0, start) + prefix + mdSource.value.substring(end);
            newCursorPos = start + prefix.length + suffixOrOffset;
        } else {
            newText = mdSource.value.substring(0, start) + prefix + mdSource.value.substring(end);
            newCursorPos = start + prefix.length;
        }
        
        mdSource.value = newText;
        handleMdInput();
        
        nextTick(() => {
            // 使用setTimeout确保DOM更新后再设置焦点和光标位置
            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(newCursorPos, newCursorPos);
            }, 0);
        });
    } else if (currentArticle.value) {
        // 富文本编辑器
        const editor = document.getElementById('my-text-editor');
        if (!editor) return;
        
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        
        if (typeof suffixOrOffset === 'string') {
            const selectedText = selection.toString();
            const textNode = document.createTextNode(prefix + selectedText + suffixOrOffset);
            range.deleteContents();
            range.insertNode(textNode);
            range.setStartAfter(textNode);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        } else if (typeof suffixOrOffset === 'number') {
            const textNode = document.createTextNode(prefix);
            range.deleteContents();
            range.insertNode(textNode);
            range.setStartAfter(textNode);
            range.setStart(textNode, textNode.length + suffixOrOffset);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        } else {
            const textNode = document.createTextNode(prefix);
            range.deleteContents();
            range.insertNode(textNode);
            range.setStartAfter(textNode);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        }
        
        // 使用setTimeout确保DOM更新后再设置焦点
        setTimeout(() => {
            editor.focus();
            handleTextInput({ target: editor });
        }, 0);
    }
};

// 插入日期时间
const insertDateTime = () => {
    const now = dayjs();
    const dateTimeStr = now.format('YYYY-MM-DD HH:mm:ss');
    insertText(dateTimeStr);
};

// 插入表格
const insertTable = () => {
    const table = `| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 内容1 | 内容2 | 内容3 |
| 内容4 | 内容5 | 内容6 |
`;
    insertText(table);
};

// 纯文本格式工具 - 富文本编辑器功能（类似Word）
const formatText = async (type) => {
    if (currentArticle.value?.format === 'md') {
        // Markdown格式下，这些操作不适用
        return;
    }
    
    const editor = document.getElementById('my-text-editor');
    if (!editor) return;
    
    // 确保编辑器获得焦点
    if (document.activeElement !== editor) {
        editor.focus();
    }
    
    // 等待焦点设置完成
    setTimeout(async () => {
        const selection = window.getSelection();
        
        // 如果编辑器没有焦点，重新设置
        if (document.activeElement !== editor) {
            editor.focus();
        }
    
        if (!selection.rangeCount && type !== 'wordCount') {
            // 某些操作不需要选中文本
            if (['find', 'replace', 'wordCount'].includes(type)) {
                // 这些操作可以继续
            } else {
                return;
            }
        }
    
        switch(type) {
        case 'bold':
            document.execCommand('bold', false, null);
            break;
        case 'italic':
            document.execCommand('italic', false, null);
            break;
        case 'underline':
            document.execCommand('underline', false, null);
            break;
        case 'strikethrough':
            document.execCommand('strikeThrough', false, null);
            break;
        case 'uppercase':
            // 转换为大写
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const selectedText = selection.toString();
                if (selectedText) {
                    const textNode = document.createTextNode(selectedText.toUpperCase());
                    range.deleteContents();
                    range.insertNode(textNode);
                    range.setStartAfter(textNode);
                    range.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            }
            break;
        case 'lowercase':
            // 转换为小写
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const selectedText = selection.toString();
                if (selectedText) {
                    const textNode = document.createTextNode(selectedText.toLowerCase());
                    range.deleteContents();
                    range.insertNode(textNode);
                    range.setStartAfter(textNode);
                    range.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            }
            break;
        case 'capitalize':
            // 首字母大写
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const selectedText = selection.toString();
                if (selectedText) {
                    const capitalized = selectedText.split(' ').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                    ).join(' ');
                    const textNode = document.createTextNode(capitalized);
                    range.deleteContents();
                    range.insertNode(textNode);
                    range.setStartAfter(textNode);
                    range.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            }
            break;
        case 'clearFormat':
            document.execCommand('removeFormat', false, null);
            break;
        case 'copy':
            document.execCommand('copy', false, null);
            return;
        case 'duplicate':
            // 复制当前行
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const selectedText = selection.toString() || range.commonAncestorContainer.textContent;
                const textNode = document.createTextNode('\n' + selectedText);
                range.setStartAfter(range.endContainer);
                range.insertNode(textNode);
            }
            break;
        case 'indent':
            document.execCommand('indent', false, null);
            break;
        case 'outdent':
            document.execCommand('outdent', false, null);
            break;
        case 'bulletList':
            document.execCommand('insertUnorderedList', false, null);
            break;
        case 'numberList':
            document.execCommand('insertOrderedList', false, null);
            break;
        case 'find':
            // 查找功能
            const searchTerm = prompt('查找:', '');
            if (searchTerm && editor.textContent) {
                const index = editor.textContent.indexOf(searchTerm);
                if (index !== -1) {
                    const range = document.createRange();
                    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
                    let currentPos = 0;
                    let textNode = null;
                    while (walker.nextNode()) {
                        const node = walker.currentNode;
                        if (currentPos + node.textContent.length >= index) {
                            textNode = node;
                            break;
                        }
                        currentPos += node.textContent.length;
                    }
                    if (textNode) {
                        range.setStart(textNode, index - currentPos);
                        range.setEnd(textNode, index - currentPos + searchTerm.length);
                        const sel = window.getSelection();
                        sel.removeAllRanges();
                        sel.addRange(range);
                        textNode.parentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                    } else {
                    await showAlert('未找到匹配项', '查找');
                }
            }
            return;
        case 'replace':
            // 查找替换功能
            const findTerm = prompt('查找:', '');
            if (findTerm && editor.innerHTML) {
                const replaceTerm = prompt('替换为:', '');
                if (replaceTerm !== null) {
                    editor.innerHTML = editor.innerHTML.replace(new RegExp(findTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replaceTerm);
                }
            }
            break;
        case 'wordCount':
            showWordStats.value = true;
            return;
        case 'alignLeft':
            document.execCommand('justifyLeft', false, null);
            break;
        case 'alignCenter':
            document.execCommand('justifyCenter', false, null);
            break;
        case 'alignRight':
            document.execCommand('justifyRight', false, null);
            break;
        }
        
        // 触发输入事件以保存
        handleTextInput({ target: editor });
    }, 10);
};

// 插入换行
const insertLineBreak = () => {
    insertText('\n');
};

// 编辑器右键菜单
const showEditorContextMenu = (event, type) => {
    event.preventDefault();
    editorContextMenuType.value = type;
    editorContextMenuPos.value = {
        x: event.clientX,
        y: event.clientY
    };
    editorContextMenuVisible.value = true;
};

const closeEditorContextMenu = () => {
    editorContextMenuVisible.value = false;
};

const handleEditorContextAction = async (action) => {
    closeEditorContextMenu();
    
    // 使用 nextTick 确保菜单关闭后再执行操作
    await nextTick();
    
    if (editorContextMenuType.value === 'md') {
        const textarea = document.getElementById('my-easymde-editor');
        if (!textarea) return;
        
        // 确保获得焦点
        textarea.focus();
        await nextTick();
        
        switch(action) {
            case 'cut':
                try {
                    document.execCommand('cut');
                    handleMdInput();
                } catch (e) {
                    console.error('Cut failed:', e);
                }
                break;
            case 'copy':
                try {
                    document.execCommand('copy');
                } catch (e) {
                    console.error('Copy failed:', e);
                }
                break;
            case 'paste':
                try {
                    // 对于textarea，使用clipboard API更可靠
                    if (navigator.clipboard && navigator.clipboard.readText) {
                        const text = await navigator.clipboard.readText();
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        const value = textarea.value;
                        textarea.value = value.substring(0, start) + text + value.substring(end);
                        textarea.setSelectionRange(start + text.length, start + text.length);
                        handleMdInput();
                    } else {
                        document.execCommand('paste');
                        handleMdInput();
                    }
                } catch (e) {
                    console.error('Paste failed:', e);
                    // 降级到 execCommand
                    try {
                        document.execCommand('paste');
                        handleMdInput();
                    } catch (e2) {
                        console.error('Fallback paste failed:', e2);
                    }
                }
                break;
        }
    } else {
        const editor = document.getElementById('my-text-editor');
        if (!editor) return;
        
        // 确保获得焦点
        editor.focus();
        await nextTick();
        
        switch(action) {
            case 'cut':
                try {
                    document.execCommand('cut');
                    handleTextInput({ target: editor });
                } catch (e) {
                    console.error('Cut failed:', e);
                }
                break;
            case 'copy':
                try {
                    document.execCommand('copy');
                } catch (e) {
                    console.error('Copy failed:', e);
                }
                break;
            case 'paste':
                try {
                    // 对于contenteditable，使用clipboard API
                    if (navigator.clipboard && navigator.clipboard.readText) {
                        const text = await navigator.clipboard.readText();
                        const selection = window.getSelection();
                        if (selection.rangeCount > 0) {
                            const range = selection.getRangeAt(0);
                            range.deleteContents();
                            const textNode = document.createTextNode(text);
                            range.insertNode(textNode);
                            range.setStartAfter(textNode);
                            range.collapse(true);
                            selection.removeAllRanges();
                            selection.addRange(range);
                        } else {
                            // 如果没有选中，在光标位置插入
                            const range = document.createRange();
                            range.selectNodeContents(editor);
                            range.collapse(false);
                            const textNode = document.createTextNode(text);
                            range.insertNode(textNode);
                            range.setStartAfter(textNode);
                            range.collapse(true);
                            selection.removeAllRanges();
                            selection.addRange(range);
                        }
                        handleTextInput({ target: editor });
                    } else {
                        // 降级到 execCommand
                        document.execCommand('paste');
                        handleTextInput({ target: editor });
                    }
                } catch (e) {
                    console.error('Paste failed:', e);
                    // 最终降级
                    try {
                        document.execCommand('paste');
                        handleTextInput({ target: editor });
                    } catch (e2) {
                        console.error('Fallback paste failed:', e2);
                    }
                }
                break;
        }
    }
};

// 保留旧的 insertMD 函数以保持兼容性
const insertMD = insertText;
const convertFormat = async (targetFormat) => {
    if (!currentArticle.value) return;
    if (currentArticle.value.format === targetFormat) {
        await showAlert('格式相同，无需转换', '格式转换');
        showConvertModal.value = false;
        return;
    }
    
    // 转换前先保存当前内容
    if (saveTimer) {
        clearTimeout(saveTimer);
        await performSave();
    }
    
    const res = await window.api.convertFormat(currentArticle.value.id, targetFormat);
    if(res && res.success) { 
        showConvertModal.value = false; 
        await refreshList();
        // 加载新创建的文档（转换后的文档）
        const newArticle = articles.value.find(a => a.id === res.newId);
        if (newArticle) {
            await loadArticle(newArticle);
            await showAlert('格式转换成功！已另存为新文档。', '转换成功');
        } else {
            await showAlert('转换成功，但未找到新文档。请刷新列表查看。', '转换成功');
            await refreshList();
        }
    } else {
        await showAlert('转换失败: ' + (res?.error || '未知错误'), '转换失败');
    }
};
const previewSnapshot = (snap) => {
  // 可以在这里添加预览功能，暂时不做处理
};

const restore = async (snap) => {
  if (!currentArticle.value) return;
  
  const result = await showConfirm({
    title: '恢复历史版本',
    message: `确定要恢复到 ${formatTime(snap.snapshot_time)} 的版本吗？\n当前内容将被覆盖。`,
    okText: '恢复'
  });
  
  if (result.confirmed) {
    const success = await window.api.restoreSnapshot(currentArticle.value.id, snap.content);
    if (success) {
      content.value = snap.content;
      // 根据格式更新编辑器内容
      if (currentArticle.value?.format === 'md') {
        mdSource.value = snap.content;
      } else {
        const editor = document.getElementById('my-text-editor');
        if (editor) {
          // 如果是HTML格式，直接设置；否则作为纯文本
          editor.innerHTML = snap.content;
        }
      }
      await loadSnapshots(); // 刷新历史记录
      appStatus.value = 'Saved';
      setTimeout(() => { if (appStatus.value === 'Saved') appStatus.value = 'Ready'; }, 2000);
    } else {
      await showAlert('恢复失败，请重试', '恢复失败');
    }
  }
};
const openConvertModal = async () => { 
    if(!currentArticle.value) {
        await showAlert('请先选择一个文档', '提示');
        return;
    }
    showConvertModal.value = true; 
};
const openConvertModalFromMenu = () => {
  if (!contextMenu.item) {
    closeContextMenu();
    return;
  }
  const targetItem = contextMenu.item; // 保存引用
  closeContextMenu();
  
  // 如果右键的是当前文档，直接打开转换模态框
  if (currentArticle.value?.id === targetItem.id) {
    showConvertModal.value = true;
  } else {
    // 否则先加载该文档
    loadArticle(targetItem).then(() => {
      showConvertModal.value = true;
    });
  }
};
// 字数统计已移至 useWordCount composable
const formatTime = (t) => dayjs(t).format('MM/DD HH:mm');
const statusText = computed(() => appStatus.value === 'Saved' ? '已保存' : (appStatus.value === 'Writing' ? '同步中...' : '就绪'));
const statusIndicator = computed(() => {
    switch(appStatus.value) {
        case 'Saved': return 'bg-green-500 shadow-green-500/50';
        case 'Writing': return 'bg-orange-400 shadow-orange-400/50';
        default: return 'bg-gray-400 dark:bg-gray-500';
    }
});
const statusTextClass = computed(() => {
    switch(appStatus.value) {
        case 'Saved': return 'text-green-600 dark:text-green-400';
        case 'Writing': return 'text-orange-500 dark:text-orange-400';
        default: return 'text-gray-500 dark:text-gray-400';
    }
});
const handleIslandAction = (action) => { if (action === 'settings') router.push('/settings'); };
const minimize = () => window.api.minimize();
const maximize = () => window.api.maximize();
const closeApp = () => window.api.close();
onBeforeUnmount(async () => {
  // 清理工作
  if (saveTimer) {
    clearTimeout(saveTimer);
    await performSave(); // 最终保存
  }
  
  // 停止当前文章的临时文件缓存
  if (currentArticle.value) {
    try {
      await window.api.stopArticleCache(currentArticle.value.id, currentArticle.value.path);
    } catch (e) {
      console.error('Failed to stop article cache on unmount:', e);
    }
  }
  
  // 清除临时缓存定时器
  if (tempCacheTimer) {
    clearInterval(tempCacheTimer);
    tempCacheTimer = null;
  }
});
</script>

<style>
/* MD编辑器样式 */
#my-easymde-editor {
    width: 100%;
    height: 100%;
    border: none;
    outline: none;
    resize: none;
    background: transparent;
    font-family: 'Consolas', 'Monaco', monospace;
    color: #374151;
}

.dark #my-easymde-editor {
    color: #e5e7eb;
}

/* 行号样式（参照VSCode） */
.md-editor-with-linenums,
.text-editor-with-linenums {
    position: relative;
}

.line-numbers-container {
    user-select: none;
    pointer-events: none;
}

.line-numbers-container:hover {
    background: rgba(0, 0, 0, 0.02);
}

.dark .line-numbers-container:hover {
    background: rgba(255, 255, 255, 0.02);
}

/* 打字机模式（类似Typora） */
.typewriter-mode {
    scroll-behavior: smooth;
}

.typewriter-mode #my-easymde-editor {
    scroll-padding: 50% 0;
}

/* 专注模式 - 淡化其他行（类似Typora） */
.focus-mode #my-easymde-editor {
    position: relative;
}

/* 专注模式：使用渐变遮罩突出当前行 */
.focus-mode #my-easymde-editor {
    background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.02) 0%,
        rgba(0, 0, 0, 0.02) calc(50% - 2em),
        transparent calc(50% - 2em),
        transparent calc(50% + 2em),
        rgba(0, 0, 0, 0.02) calc(50% + 2em),
        rgba(0, 0, 0, 0.02) 100%
    );
    background-attachment: local;
}

.dark .focus-mode #my-easymde-editor {
    background: linear-gradient(
        to bottom,
        rgba(255, 255, 255, 0.02) 0%,
        rgba(255, 255, 255, 0.02) calc(50% - 2em),
        transparent calc(50% - 2em),
        transparent calc(50% + 2em),
        rgba(255, 255, 255, 0.02) calc(50% + 2em),
        rgba(255, 255, 255, 0.02) 100%
    );
    background-attachment: local;
}

/* 专注模式：淡化非当前行的文本（类似Typora） */
.focus-mode #my-easymde-editor {
    opacity: 0.5;
    transition: opacity 0.3s ease;
}

/* 当前行区域保持不透明 */
.focus-mode #my-easymde-editor.focus-active-line {
    opacity: 1;
}

/* 当前行高亮背景 */
.focus-mode #my-easymde-editor.focus-active-line {
    background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.02) 0%,
        rgba(0, 0, 0, 0.02) calc(50% - 2.5em),
        rgba(99, 102, 241, 0.08) calc(50% - 2.5em),
        rgba(99, 102, 241, 0.08) calc(50% + 2.5em),
        rgba(0, 0, 0, 0.02) calc(50% + 2.5em),
        rgba(0, 0, 0, 0.02) 100%
    );
    background-attachment: local;
}

.dark .focus-mode #my-easymde-editor.focus-active-line {
    background: linear-gradient(
        to bottom,
        rgba(255, 255, 255, 0.02) 0%,
        rgba(255, 255, 255, 0.02) calc(50% - 2.5em),
        rgba(99, 102, 241, 0.15) calc(50% - 2.5em),
        rgba(99, 102, 241, 0.15) calc(50% + 2.5em),
        rgba(255, 255, 255, 0.02) calc(50% + 2.5em),
        rgba(255, 255, 255, 0.02) 100%
    );
    background-attachment: local;
}

.toolbar-btn {
    @apply p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-gray-900 rounded-md transition-all flex items-center justify-center min-w-[32px] shadow-sm border border-transparent hover:border-indigo-100 dark:hover:border-indigo-800;
}

.toolbar-btn-active {
    @apply p-2 rounded-lg transition-all flex items-center justify-center min-w-[36px] min-h-[36px] shadow-sm border border-transparent;
    @apply hover:bg-white/90 dark:hover:bg-gray-800/90 hover:scale-110 active:scale-95;
    @apply hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-700;
    @apply backdrop-blur-sm;
}

.toolbar-btn-simple {
    @apply p-2 rounded-md transition-all duration-200 flex items-center justify-center min-w-[32px] min-h-[32px];
    @apply hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95;
    @apply transform hover:scale-110;
}

/* 富文本编辑器样式（类似Word） */
.rich-text-editor {
    min-height: 100%;
}

.rich-text-editor:empty:before {
    content: attr(data-placeholder);
    color: #9ca3af;
    pointer-events: none;
}

.rich-text-editor.empty:before {
    content: attr(data-placeholder);
    color: #9ca3af;
    pointer-events: none;
}

.dark .rich-text-editor:empty:before,
.dark .rich-text-editor.empty:before {
    color: #6b7280;
}

/* 富文本编辑器内容样式 */
.rich-text-editor p {
    margin: 0.5em 0;
}

.rich-text-editor h1, .rich-text-editor h2, .rich-text-editor h3 {
    margin: 1em 0 0.5em 0;
    font-weight: bold;
}

.rich-text-editor ul, .rich-text-editor ol {
    margin: 0.5em 0;
    padding-left: 2em;
}

.rich-text-editor blockquote {
    margin: 0.5em 0;
    padding-left: 1em;
    border-left: 3px solid #d1d5db;
}

.dark .rich-text-editor blockquote {
    border-left-color: #4b5563;
}

/* MD预览样式 */
.markdown-preview {
    max-width: none;
}

.markdown-preview h1, .markdown-preview h2, .markdown-preview h3, .markdown-preview h4, .markdown-preview h5, .markdown-preview h6 {
    margin-top: 1em;
    margin-bottom: 0.5em;
    font-weight: bold;
    line-height: 1.4;
}

.markdown-preview h1 { font-size: 2em; }
.markdown-preview h2 { font-size: 1.5em; }
.markdown-preview h3 { font-size: 1.25em; }
.markdown-preview h4 { font-size: 1.1em; }

.markdown-preview p {
    margin: 0.5em 0;
    line-height: 1.8;
}

.markdown-preview ul, .markdown-preview ol {
    margin: 0.5em 0;
    padding-left: 2em;
    line-height: 1.8;
}

.markdown-preview li {
    margin: 0.25em 0;
}

.markdown-preview code {
    background: rgba(0, 0, 0, 0.05);
    padding: 0.2em 0.4em;
    border-radius: 0.25rem;
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 0.9em;
}

.dark .markdown-preview code {
    background: rgba(255, 255, 255, 0.1);
    color: #e5e7eb;
}

.markdown-preview pre {
    background: rgba(0, 0, 0, 0.05);
    padding: 1em;
    border-radius: 0.5rem;
    overflow-x: auto;
    margin: 1em 0;
}

.markdown-preview pre code {
    background: transparent;
    padding: 0;
}

.dark .markdown-preview pre {
    background: rgba(255, 255, 255, 0.05);
}

.markdown-preview blockquote {
    border-left: 3px solid #d1d5db;
    padding-left: 1em;
    margin: 1em 0;
    color: #6b7280;
    font-style: italic;
}

.dark .markdown-preview blockquote {
    border-left-color: #4b5563;
    color: #9ca3af;
}

.markdown-preview a {
    color: #6366f1;
    text-decoration: underline;
}

.dark .markdown-preview a {
    color: #818cf8;
}

.markdown-preview a:hover {
    color: #4f46e5;
}

.dark .markdown-preview a:hover {
    color: #a5b4fc;
}

.markdown-preview img {
    max-width: 100%;
    height: auto;
    border-radius: 0.5rem;
    margin: 1em 0;
}

/* 富文本编辑器中的图片 */
.rich-text-editor img {
    max-width: 100%;
    height: auto;
    border-radius: 0.5rem;
    margin: 1em 0;
    display: block;
    object-fit: contain;
}

.rich-text-editor img[src^="data:image"] {
    max-width: 100%;
    max-height: 500px;
    border-radius: 0.5rem;
    margin: 1em auto;
    display: block;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.dark .rich-text-editor img[src^="data:image"] {
    box-shadow: 0 2px 8px rgba(255, 255, 255, 0.1);
}

.markdown-preview table {
    border-collapse: collapse;
    width: 100%;
    margin: 1em 0;
}

.markdown-preview table th,
.markdown-preview table td {
    border: 1px solid #d1d5db;
    padding: 0.5em;
    text-align: left;
}

.dark .markdown-preview table th,
.dark .markdown-preview table td {
    border-color: #4b5563;
}

.markdown-preview table th {
    background: rgba(0, 0, 0, 0.05);
    font-weight: bold;
}

.dark .markdown-preview table th {
    background: rgba(255, 255, 255, 0.05);
}

.markdown-preview hr {
    border: none;
    border-top: 2px solid #e5e7eb;
    margin: 2em 0;
}

.dark .markdown-preview hr {
    border-top-color: #4b5563;
}

/* 自定义滚动条 */
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
    transition: background 0.2s ease;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.2);
}

.no-scrollbar::-webkit-scrollbar {
    display: none;
}

/* 过渡动画 */
.modal-enter-active, .modal-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
}

.modal-leave-to {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
}

/* 全局过渡优化 */
* {
    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 200ms;
}

/* 按钮交互优化 */
button {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

button:active {
    transform: scale(0.98);
}
</style>