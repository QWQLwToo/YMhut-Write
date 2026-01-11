<template>
  <div class="h-screen w-full bg-gray-50 dark:bg-black flex flex-col font-sans relative z-50 animate-fade-in transition-colors duration-300 overflow-hidden select-none">
    
    <div class="h-16 flex-shrink-0 flex items-center justify-between px-6 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20 [-webkit-app-region:drag] transition-colors duration-300">
      <button @click="$router.back()" class="group flex items-center gap-2 pl-2 pr-4 py-1.5 bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-all duration-300 [-webkit-app-region:no-drag]">
        <div class="w-6 h-6 bg-white dark:bg-black rounded-full shadow-sm flex items-center justify-center text-gray-600 dark:text-gray-200 group-hover:text-black dark:group-hover:text-white transition-colors">
          <Icon name="arrow-left" :size="14" color="currentColor" />
        </div>
        <span class="text-xs font-bold text-gray-600 dark:text-gray-200 group-hover:text-black dark:group-hover:text-white transition-colors">{{ t.common.close }}</span>
      </button>
      <div class="font-bold text-base text-gray-800 dark:text-white tracking-wide transition-colors">{{ t.common.settings }}</div>
      <div class="w-24"></div> 
    </div>

    <div class="flex-1 flex overflow-hidden">
      <!-- 侧边栏 -->
      <div class="w-64 bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 flex flex-col transition-colors duration-300">
        <div class="p-4 space-y-1">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200"
            :class="activeTab === tab.id
              ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/50'"
          >
            <svg v-if="tab.id === 'appearance'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="shrink-0">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            </svg>
            <Icon v-else-if="tab.id === 'editor'" name="code" :size="18" color="currentColor" class="shrink-0" />
            <svg v-else-if="tab.id === 'logs'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="shrink-0">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <Icon v-else-if="tab.id === 'about'" name="info" :size="18" color="currentColor" class="shrink-0" />
            <span>{{ tab.label }}</span>
          </button>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="flex-1 overflow-y-auto custom-scrollbar">
        <div class="max-w-3xl mx-auto p-8">
          <!-- 外观设置 -->
          <div v-if="activeTab === 'appearance'" class="space-y-6">
            <div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6 transition-colors">{{ t.settings.theme.title }}</h2>
              
              <div class="bg-white dark:bg-black rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors duration-300">
                <div class="p-6">
                  <div class="text-sm font-bold text-gray-800 dark:text-white mb-4 transition-colors">{{ t.settings.theme.themeMode }}</div>
                  <div class="grid grid-cols-2 gap-4">
                    <button 
                      @click="switchTheme('light')"
                      class="relative p-5 rounded-xl border-2 transition-all duration-300 group"
                      :class="settings.theme === 'light' 
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                        : 'border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700'"
                    >
                      <div class="flex flex-col items-center gap-3">
                        <div class="w-14 h-14 rounded-lg bg-white border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center transition-all duration-300">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#374151" stroke-width="2">
                            <circle cx="12" cy="12" r="5"/>
                            <line x1="12" y1="1" x2="12" y2="3"/>
                            <line x1="12" y1="21" x2="12" y2="23"/>
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                            <line x1="1" y1="12" x2="3" y2="12"/>
                            <line x1="21" y1="12" x2="23" y2="12"/>
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                          </svg>
                        </div>
                        <span class="text-sm font-bold text-gray-700 dark:text-gray-200 transition-colors">{{ t.settings.theme.light }}</span>
                      </div>
                      <div v-if="settings.theme === 'light'" class="absolute top-3 right-3 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </div>
                    </button>

                    <button 
                      @click="switchTheme('dark')"
                      class="relative p-5 rounded-xl border-2 transition-all duration-300 group"
                      :class="settings.theme === 'dark' 
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                        : 'border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700'"
                    >
                      <div class="flex flex-col items-center gap-3">
                        <div class="w-14 h-14 rounded-lg bg-black dark:bg-black border-2 border-gray-800 dark:border-gray-800 flex items-center justify-center transition-all duration-300">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-white">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                          </svg>
                        </div>
                        <span class="text-sm font-bold text-gray-700 dark:text-gray-200 transition-colors">{{ t.settings.theme.dark }}</span>
                      </div>
                      <div v-if="settings.theme === 'dark'" class="absolute top-3 right-3 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 编辑器设置 -->
          <div v-if="activeTab === 'editor'" class="space-y-6">
            <div>
              <div class="bg-white dark:bg-black rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden divide-y divide-gray-50 dark:divide-gray-900 transition-colors duration-300">
                <!-- Markdown编辑器设置 -->
                <div class="p-5">
                  <div class="text-sm font-bold text-gray-800 dark:text-white mb-4 transition-colors flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    {{ t.settings.editor.markdown }}
                  </div>
                  
                  <div class="space-y-3">
                    <div class="flex items-center justify-between group hover:bg-gray-50/50 dark:hover:bg-gray-900/50 p-3 rounded-lg transition-colors">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                          <Icon name="code" :size="16" color="#6366f1" />
                        </div>
                        <div>
                          <div class="text-sm font-medium text-gray-800 dark:text-white transition-colors">{{ t.settings.editor.showRawMd }}</div>
                          <div class="text-[10px] text-gray-400 dark:text-gray-500 transition-colors">{{ t.settings.editor.showRawMdDesc }}</div>
                        </div>
                      </div>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" v-model="settings.showRawMd" @change="applyChange" class="sr-only peer">
                        <div class="w-11 h-6 bg-gray-200 dark:bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                    
                    <div class="flex items-center justify-between group hover:bg-gray-50/50 dark:hover:bg-gray-900/50 p-3 rounded-lg transition-colors">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-purple-600 dark:text-purple-400">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <line x1="3" y1="9" x2="21" y2="9"/>
                            <line x1="9" y1="3" x2="9" y2="21"/>
                          </svg>
                        </div>
                        <div>
                          <div class="text-sm font-medium text-gray-800 dark:text-white transition-colors">{{ t.settings.editor.typewriterMode }}</div>
                          <div class="text-[10px] text-gray-400 dark:text-gray-500 transition-colors">{{ t.settings.editor.typewriterModeDesc }}</div>
                        </div>
                      </div>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" v-model="settings.typewriterMode" @change="applyChange" class="sr-only peer">
                        <div class="w-11 h-6 bg-gray-200 dark:bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                    
                    <div class="flex items-center justify-between group hover:bg-gray-50/50 dark:hover:bg-gray-900/50 p-3 rounded-lg transition-colors">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-blue-600 dark:text-blue-400">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                          </svg>
                        </div>
                        <div>
                          <div class="text-sm font-medium text-gray-800 dark:text-white transition-colors">{{ t.settings.editor.focusMode }}</div>
                          <div class="text-[10px] text-gray-400 dark:text-gray-500 transition-colors">{{ t.settings.editor.focusModeDesc }}</div>
                        </div>
                      </div>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" v-model="settings.focusMode" @change="applyChange" class="sr-only peer">
                        <div class="w-11 h-6 bg-gray-200 dark:bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                    
                    <div class="flex items-center justify-between group hover:bg-gray-50/50 dark:hover:bg-gray-900/50 p-3 rounded-lg transition-colors">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-green-600 dark:text-green-400">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                            <line x1="12" y1="22.08" x2="12" y2="12"/>
                          </svg>
                        </div>
                        <div>
                          <div class="text-sm font-medium text-gray-800 dark:text-white transition-colors">{{ t.settings.editor.sourceMode }}</div>
                          <div class="text-[10px] text-gray-400 dark:text-gray-500 transition-colors">{{ t.settings.editor.sourceModeDesc }}</div>
                        </div>
                      </div>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" v-model="settings.sourceMode" @change="applyChange" class="sr-only peer">
                        <div class="w-11 h-6 bg-gray-200 dark:bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div class="p-5">
                  <div class="text-sm font-bold text-gray-800 dark:text-white mb-4 transition-colors flex items-center gap-2">
                    <Icon name="font" :size="16" color="currentColor" />
                    {{ t.settings.general.title || '通用设置' }}
                  </div>
                  
                  <div class="space-y-3">
                    <!-- 语言选择 -->
                    <div class="flex items-center justify-between group hover:bg-gray-50/50 dark:hover:bg-gray-900/50 p-3 rounded-lg transition-colors">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-600 dark:text-gray-400">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="2" y1="12" x2="22" y2="12"/>
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                          </svg>
                        </div>
                        <div>
                          <div class="text-sm font-medium text-gray-800 dark:text-white transition-colors">{{ t.settings.general.language }}</div>
                          <div class="text-[10px] text-gray-400 dark:text-gray-500 transition-colors">{{ t.settings.general.languageDesc }}</div>
                        </div>
                      </div>
                      <div class="relative">
                        <select 
                          v-model="settings.language" 
                          @change="applyLanguageChange"
                          class="custom-select appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 pl-4 pr-10 text-sm font-medium text-gray-700 dark:text-gray-200 outline-none cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all duration-200 w-48 shadow-sm hover:shadow-md"
                        >
                          <option 
                            v-for="locale in availableLocales" 
                            :key="locale.code" 
                            :value="locale.code"
                            class="bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200"
                          >
                            {{ locale.nativeName }}
                          </option>
                        </select>
                        <svg class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-gray-500 transition-colors" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M6 9l6 6 6-6"/>
                        </svg>
                      </div>
                    </div>

                    <div class="flex items-center justify-between group hover:bg-gray-50/50 dark:hover:bg-gray-900/50 p-3 rounded-lg transition-colors">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                          <Icon name="font" :size="16" color="#6b7280" />
                        </div>
                        <div>
                          <div class="text-sm font-medium text-gray-800 dark:text-white transition-colors">{{ t.settings.general.fontFamily }}</div>
                        </div>
                      </div>
                      <div class="relative">
                        <select 
                          v-model="settings.fontFamily" 
                          @change="applyChange" 
                          class="custom-select appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 pl-4 pr-10 text-sm font-medium text-gray-700 dark:text-gray-200 outline-none cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all duration-200 w-48 shadow-sm hover:shadow-md"
                        >
                          <option value="" class="bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200">{{ t.settings.general.followSystem }}</option>
                          <option 
                            v-for="font in fontList" 
                            :key="font.name" 
                            :value="font.value"
                            :style="{ fontFamily: font.value }"
                            class="bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200"
                          >
                            {{ font.name }}
                          </option>
                        </select>
                        <svg class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-gray-500 transition-colors" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M6 9l6 6 6-6"/>
                        </svg>
                      </div>
                    </div>

                    <div class="flex items-center justify-between group hover:bg-gray-50/50 dark:hover:bg-gray-900/50 p-3 rounded-lg transition-colors">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                          <Icon name="text-size" :size="16" color="#6b7280" />
                        </div>
                        <div>
                          <div class="text-sm font-medium text-gray-800 dark:text-white transition-colors">{{ t.settings.general.fontSize }}</div>
                        </div>
                      </div>
                      <div class="flex items-center gap-3 bg-gray-100 dark:bg-gray-900 rounded-lg px-3 py-1.5">
                        <span class="text-xs text-gray-400 dark:text-gray-600 font-bold">A</span>
                        <input type="range" min="14" max="32" step="1" v-model="settings.fontSize" @input="applyChange" class="accent-indigo-600 w-24 h-1 bg-gray-300 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer">
                        <span class="text-sm text-gray-800 dark:text-white font-bold w-6 text-center transition-colors">{{ settings.fontSize }}</span>
                      </div>
                    </div>

                    <div class="flex items-center justify-between group hover:bg-gray-50/50 dark:hover:bg-gray-900/50 p-3 rounded-lg transition-colors">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-600 dark:text-gray-400">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                            <polyline points="17 21 17 13 7 13 7 21"/>
                            <polyline points="7 3 7 8 15 8"/>
                          </svg>
                        </div>
                        <div>
                          <div class="text-sm font-medium text-gray-800 dark:text-white transition-colors">{{ t.settings.general.autoSave }}</div>
                          <div class="text-[10px] text-gray-400 dark:text-gray-500 transition-colors">{{ t.settings.general.autoSaveDesc }}</div>
                        </div>
                      </div>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" v-model="settings.autoSave" @change="applyChange" class="sr-only peer">
                        <div class="w-11 h-6 bg-gray-200 dark:bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div class="flex items-center justify-between group hover:bg-gray-50/50 dark:hover:bg-gray-900/50 p-3 rounded-lg transition-colors">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-600 dark:text-gray-400">
                            <line x1="4" y1="7" x2="20" y2="7"/>
                            <line x1="4" y1="12" x2="20" y2="12"/>
                            <line x1="4" y1="17" x2="20" y2="17"/>
                          </svg>
                        </div>
                        <div>
                          <div class="text-sm font-medium text-gray-800 dark:text-white transition-colors">{{ t.settings.general.showLineNumbers }}</div>
                          <div class="text-[10px] text-gray-400 dark:text-gray-500 transition-colors">{{ t.settings.general.showLineNumbersDesc }}</div>
                        </div>
                      </div>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" v-model="settings.showLineNumbers" @change="applyChange" class="sr-only peer">
                        <div class="w-11 h-6 bg-gray-200 dark:bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div class="flex items-center justify-between group hover:bg-gray-50/50 dark:hover:bg-gray-900/50 p-3 rounded-lg transition-colors">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-600 dark:text-gray-400">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                            <polyline points="10 9 9 9 8 9"/>
                          </svg>
                        </div>
                        <div>
                          <div class="text-sm font-medium text-gray-800 dark:text-white transition-colors">{{ t.settings.general.outlineMode }}</div>
                          <div class="text-[10px] text-gray-400 dark:text-gray-500 transition-colors">{{ t.settings.general.outlineModeDesc }}</div>
                        </div>
                      </div>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" v-model="settings.outlineMode" @change="applyChange" class="sr-only peer">
                        <div class="w-11 h-6 bg-gray-200 dark:bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 运行日志 -->
          <div v-if="activeTab === 'logs'" class="space-y-6">
            <div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6 transition-colors">{{ t.settings.logs.title }}</h2>
              
              <div class="bg-white dark:bg-black rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors duration-300">
                <!-- 日期选择器 -->
                <div class="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-indigo-600 dark:text-indigo-400">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                    </div>
                    <div>
                      <div class="text-sm font-medium text-gray-800 dark:text-white transition-colors">{{ t.settings.logs.selectDate }}</div>
                      <div class="text-[10px] text-gray-400 dark:text-gray-500 transition-colors">{{ t.settings.logs.selectDateDesc }}</div>
                    </div>
                  </div>
                  <select 
                    v-model="selectedLogDate" 
                    @change="loadLogs"
                    class="custom-select appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl py-2 pl-4 pr-10 text-sm font-medium text-gray-700 dark:text-gray-200 outline-none cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <option value="">{{ t.settings.logs.today }}</option>
                    <option 
                      v-for="date in availableLogDates" 
                      :key="date" 
                      :value="date"
                      class="bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200"
                    >
                      {{ formatLogDate(date) }}
                    </option>
                  </select>
                </div>

                <!-- 日志列表 -->
                <div class="p-6 max-h-[600px] overflow-y-auto custom-scrollbar">
                  <div v-if="logs.length === 0" class="text-center py-12 text-gray-400 dark:text-gray-500">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mx-auto mb-4 opacity-50">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                    <p class="text-sm font-medium">暂无日志记录</p>
                    <p class="text-xs mt-1">当出现错误时，日志将自动记录在这里</p>
                  </div>
                  
                  <!-- 时间线样式的日志 -->
                  <div v-else class="space-y-4">
                    <div 
                      v-for="(log, index) in logs" 
                      :key="index"
                      class="relative pl-8 pb-4 border-l-2 border-gray-200 dark:border-gray-800 last:border-l-0"
                      :class="{
                        'border-red-300 dark:border-red-800': log.level === 'error',
                        'border-yellow-300 dark:border-yellow-800': log.level === 'warn',
                        'border-blue-300 dark:border-blue-800': log.level === 'info'
                      }"
                    >
                      <!-- 时间线节点 -->
                      <div 
                        class="absolute left-0 top-1 w-4 h-4 rounded-full border-2 border-white dark:border-black -translate-x-[9px]"
                        :class="{
                          'bg-red-500 border-red-500': log.level === 'error',
                          'bg-yellow-500 border-yellow-500': log.level === 'warn',
                          'bg-blue-500 border-blue-500': log.level === 'info'
                        }"
                      ></div>
                      
                      <!-- 日志内容 -->
                      <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all duration-200">
                        <!-- 头部：时间和级别 -->
                        <div class="flex items-center justify-between mb-2">
                          <div class="flex items-center gap-2">
                            <span 
                              class="text-xs font-bold px-2 py-0.5 rounded"
                              :class="{
                                'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400': log.level === 'error',
                                'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400': log.level === 'warn',
                                'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400': log.level === 'info'
                              }"
                            >
                              {{ log.level.toUpperCase() }}
                            </span>
                            <span class="text-xs text-gray-500 dark:text-gray-400 font-mono">
                              {{ formatLogTimestamp(log.timestamp) }}
                            </span>
                          </div>
                          <button
                            @click="copyLogEntry(log.fullText)"
                            class="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors group"
                            :title="copyStates[log.fullText] === 'success' ? t.settings.logs.copied : copyStates[log.fullText] === 'error' ? t.settings.logs.copyFailed : t.settings.logs.copy"
                          >
                            <svg 
                              v-if="copyStates[log.fullText] === 'success'"
                              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-green-500 dark:text-green-400"
                            >
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            <svg 
                              v-else-if="copyStates[log.fullText] === 'error'"
                              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-red-500 dark:text-red-400"
                            >
                              <circle cx="12" cy="12" r="10"/>
                              <line x1="12" y1="8" x2="12" y2="12"/>
                              <line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                            <svg 
                              v-else
                              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
                            >
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                            </svg>
                          </button>
                        </div>
                        
                        <!-- 消息 -->
                        <div class="text-sm font-medium text-gray-800 dark:text-white mb-1 transition-colors">
                          {{ log.message }}
                        </div>
                        
                        <!-- 详情（如果有） -->
                        <div 
                          v-if="log.details" 
                          class="mt-2 text-xs text-gray-600 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-800 rounded-lg p-2 overflow-x-auto whitespace-pre-wrap transition-colors"
                        >
                          {{ log.details }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 关于 -->
          <div v-if="activeTab === 'about'" class="space-y-6">
            <div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6 transition-colors">{{ t.settings.about.title }}</h2>
              
              <div class="bg-white dark:bg-black rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden divide-y divide-gray-50 dark:divide-gray-900 transition-colors duration-300">
                <div class="p-6">
                  <div class="flex items-center gap-4 mb-6">
                    <div class="w-16 h-16 rounded-xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center shadow-lg">
                      <Icon name="edit" :size="32" color="#ffffff" />
                    </div>
                    <div>
                      <div class="text-xl font-bold text-gray-800 dark:text-white transition-colors">YMhut-Write</div>
                      <div class="text-sm text-gray-500 dark:text-gray-400 transition-colors">{{ t.settings.about.subtitle }}</div>
                    </div>
                  </div>
                  <div class="space-y-3 text-sm text-gray-600 dark:text-gray-400 transition-colors">
                    <div class="flex items-center gap-3">
                      <Icon name="tag" :size="16" color="#9ca3af" />
                      <span>{{ t.settings.about.version }}: <span class="font-bold text-gray-800 dark:text-white transition-colors">{{ appVersion }}</span></span>
                    </div>
                    <div class="flex items-center gap-3">
                      <Icon name="user" :size="16" color="#9ca3af" />
                      <span>{{ t.settings.about.author }}: <span class="font-bold text-gray-800 dark:text-white transition-colors">YMhut</span></span>
                    </div>
                    <div class="flex items-center gap-3">
                      <Icon name="calendar" :size="16" color="#9ca3af" />
                      <span>{{ t.settings.about.updateDate }}: <span class="font-bold text-gray-800 dark:text-white transition-colors">{{ buildDate }}</span></span>
                    </div>
                  </div>
                </div>

                <div class="p-6 space-y-3">
                  <div 
                    @click="openLink('https://github.com/QWQLwToo/YMhut-Write')"
                    class="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors group cursor-pointer"
                  >
                    <div class="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-900 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 flex items-center justify-center transition-colors">
                      <Icon name="github" :size="22" color="#6b7280" class="group-hover:!text-indigo-600 dark:group-hover:!text-indigo-400" />
                    </div>
                    <div class="flex-1">
                      <div class="text-sm font-bold text-gray-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{{ t.settings.about.repository }}</div>
                      <div class="text-xs text-gray-400 dark:text-gray-500 transition-colors">GitHub - QWQLwToo/YMhut-Write</div>
                    </div>
                    <Icon name="external-link" :size="18" color="#9ca3af" class="group-hover:!text-indigo-600 dark:group-hover:!text-indigo-400 transition-colors" />
                  </div>

                  <div 
                    @click="openLink('https://github.com/QWQLwToo/YMhut-Write/issues')"
                    class="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors group cursor-pointer"
                  >
                    <div class="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-900 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 flex items-center justify-center transition-colors">
                      <Icon name="bug" :size="22" color="#6b7280" class="group-hover:!text-indigo-600 dark:group-hover:!text-indigo-400" />
                    </div>
                    <div class="flex-1">
                      <div class="text-sm font-bold text-gray-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{{ t.settings.about.issues }}</div>
                      <div class="text-xs text-gray-400 dark:text-gray-500 transition-colors">提交 Bug 或功能建议</div>
                    </div>
                    <Icon name="external-link" :size="18" color="#9ca3af" class="group-hover:!text-indigo-600 dark:group-hover:!text-indigo-400 transition-colors" />
                  </div>

                  <div 
                    @click="openLink('https://github.com/QWQLwToo/YMhut-Write/blob/main/LICENSE')"
                    class="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors group cursor-pointer"
                  >
                    <div class="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-900 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 flex items-center justify-center transition-colors">
                      <Icon name="file-text" :size="22" color="#6b7280" class="group-hover:!text-indigo-600 dark:group-hover:!text-indigo-400" />
                    </div>
                    <div class="flex-1">
                      <div class="text-sm font-bold text-gray-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{{ t.settings.about.license }}</div>
                      <div class="text-xs text-gray-400 dark:text-gray-500 transition-colors">查看许可证信息</div>
                    </div>
                    <Icon name="external-link" :size="18" color="#9ca3af" class="group-hover:!text-indigo-600 dark:group-hover:!text-indigo-400 transition-colors" />
                  </div>
                </div>

                <div class="p-6 bg-gray-50/50 dark:bg-black/50">
                  <div class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed transition-colors">
                    <p class="whitespace-pre-line">{{ t.settings.about.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <transition name="toast">
      <div v-if="showToast" class="fixed bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-black text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-[0_10px_30px_rgba(0,0,0,0.2)] flex items-center gap-2 z-50 transition-colors duration-300 border border-gray-800 dark:border-gray-800">
        <Icon name="check-circle" :size="16" color="#4ade80" />
        <span>{{ t.messages.saved }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed, watch } from 'vue';
import dayjs from 'dayjs';
import Icon from '../components/Icon.vue';
import { useI18n } from '../composables/useI18n';

const { t, setLocale, initLocale, getAvailableLocales } = useI18n();
const availableLocales = getAvailableLocales();

const activeTab = ref('appearance');
const fontList = ref([]);
const showToast = ref(false);
let toastTimer = null;

// 运行日志相关
const logs = ref([]);
const availableLogDates = ref([]);
const selectedLogDate = ref('');
const copyStates = ref({});

const tabs = computed(() => [
  { id: 'appearance', label: t.value.settings.theme.title || '外观' },
  { id: 'editor', label: t.value.common.editor || '编辑器' },
  { id: 'logs', label: t.value.settings.logs.title || '运行日志' },
  { id: 'about', label: t.value.settings.about.title || '关于' }
]);

const settings = reactive({
  theme: 'light',
  language: 'zh-CN',
  fontFamily: '',
  fontSize: '18',
  showRawMd: false,
  autoSave: true,
  showLineNumbers: false,
  outlineMode: false,
  typewriterMode: false,
  focusMode: false,
  sourceMode: false
});

const appVersion = ref('1.0.0');
const buildDate = computed(() => {
  return dayjs().format('YYYY-MM-DD');
});

onMounted(async () => {
  fontList.value = await window.api.getSystemFonts();
  const current = await window.api.getSettings();
  Object.assign(settings, current);
  
  // 初始化语言
  if (settings.language) {
    initLocale(settings.language);
    setLocale(settings.language);
  }
  
  // 监听语言变化事件
  if (window.api.onLanguageChanged) {
    window.api.onLanguageChanged((locale) => {
      setLocale(locale);
    });
  }
  
  if (settings.theme) {
    applyTheme(settings.theme);
  }
  
  try {
    const version = await window.api.getAppVersion();
    if (version) appVersion.value = version;
  } catch (e) {
    console.error('Failed to get app version:', e);
  }
  
  // 加载运行日志
  // 加载运行日志
  await loadLogDates();
  await loadLogs();
  
  // 监听标签页切换，如果是运行日志标签页，刷新日志
  watch(activeTab, (newTab) => {
    if (newTab === 'logs') {
      loadLogs();
    }
  });
});

// 运行日志相关函数
const loadLogDates = async () => {
  try {
    availableLogDates.value = await window.api.getAvailableLogDates();
  } catch (e) {
    console.error('Failed to load log dates:', e);
  }
};

const loadLogs = async () => {
  try {
    logs.value = await window.api.getLogs(selectedLogDate.value || null);
  } catch (e) {
    console.error('Failed to load logs:', e);
    logs.value = [];
  }
};

const formatLogDate = (dateStr) => {
  if (!dateStr) return t.value.settings.logs.today;
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return t.value.settings.logs.today;
  } else if (date.toDateString() === yesterday.toDateString()) {
    return t.value.settings.logs.yesterday;
  } else {
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  }
};

const formatLogTimestamp = (timestamp) => {
  try {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', { 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  } catch (e) {
    return timestamp;
  }
};

const copyLogEntry = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    copyStates.value[text] = 'success';
    setTimeout(() => {
      copyStates.value[text] = null;
    }, 2000);
  } catch (e) {
    copyStates.value[text] = 'error';
    setTimeout(() => {
      copyStates.value[text] = null;
    }, 2000);
  }
};

const applyTheme = (theme) => {
  settings.theme = theme;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
  }
};

const switchTheme = (theme) => {
  applyTheme(theme);
  applyChange();
};

const applyChange = async () => {
  await window.api.saveSettings(JSON.parse(JSON.stringify(settings)));
  showToast.value = true;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { showToast.value = false; }, 2000);
};

// 应用语言变化（立即生效）
const applyLanguageChange = async () => {
  setLocale(settings.language);
  await window.api.saveSettings(JSON.parse(JSON.stringify(settings)));
  showToast.value = true;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { showToast.value = false; }, 2000);
};

const openLink = async (url) => {
  try {
    await window.api.openExternal(url);
  } catch (e) {
    console.error('Failed to open external link:', e);
    if (window.open) {
      window.open(url, '_blank');
    }
  }
};
</script>

<style scoped>
/* 自定义下拉框样式 */
.custom-select {
  background-image: none;
}

.custom-select option {
  padding: 8px 12px;
  font-size: 14px;
}

.custom-select:focus {
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.dark .custom-select:focus {
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

/* 全局应用字体 */
:deep(.custom-select),
:deep(.custom-select option) {
  font-family: inherit;
}

/* 确保字体选择器在所有浏览器中显示一致 */
.custom-select::-ms-expand {
  display: none;
}

.custom-select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
.toast-enter-active, .toast-leave-active { transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, 20px); }

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  transition: background 0.2s ease;
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.1) transparent;
}

.dark .custom-scrollbar {
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}
</style>
