<template>
  <div class="h-screen w-full bg-gray-100/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center select-none transition-colors duration-500">
    <!-- 顶部拖动区域 -->
    <div class="absolute top-0 left-0 right-0 h-12 [-webkit-app-region:drag] z-50"></div>
    
    <!-- 窗口控制按钮 -->
    <div class="fixed top-4 right-4 flex items-center gap-3 z-[9999] [-webkit-app-region:no-drag]">
      <button 
        @click="minimize" 
        class="w-3.5 h-3.5 rounded-full bg-[#FF5F57] border border-[#E0443E] shadow-sm hover:brightness-90 transition"
      ></button>
      <button 
        @click="maximize" 
        class="w-3.5 h-3.5 rounded-full bg-[#FEBC2E] border border-[#D89E24] shadow-sm hover:brightness-90 transition"
      ></button>
      <button 
        @click="closeApp" 
        class="w-3.5 h-3.5 rounded-full bg-[#28C840] border border-[#1AAB29] shadow-sm hover:brightness-90 transition"
      ></button>
    </div>
    
    <div class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md w-[800px] h-[600px] rounded-3xl shadow-2xl p-8 flex flex-col relative overflow-hidden border border-gray-300/50 dark:border-gray-700/50 transition-all duration-500">
      
      <!-- 步骤指示器 - 优化动画 -->
      <div class="flex justify-center items-center mb-12 relative z-10">
        <div v-for="step in 5" :key="step" class="flex items-center">
          <transition name="step-bounce" appear>
            <div 
              class="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 relative"
              :class="currentStep >= step ? 'bg-indigo-600 text-white shadow-lg scale-110 ring-4 ring-indigo-200 dark:ring-indigo-900' : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'"
            >
              <span v-if="currentStep > step" class="absolute text-lg">✓</span>
              <span v-else>{{ step }}</span>
            </div>
          </transition>
          <div v-if="step < 5" class="w-20 h-1.5 bg-gray-200 dark:bg-gray-700 mx-3 rounded-full overflow-hidden">
            <transition name="progress-fill">
              <div 
                v-if="currentStep > step"
                class="h-full bg-indigo-500 rounded-full transition-all duration-700 ease-out"
                :style="{ width: '100%' }"
              ></div>
            </transition>
          </div>
        </div>
      </div>

      <transition name="slide-fade" mode="out-in">
        <div :key="currentStep" class="flex-1 flex flex-col items-center justify-center text-center px-12">
          
          <!-- 步骤1: 语言选择 -->
          <div v-if="currentStep === 1" class="w-full">
            <transition name="slide-up" appear>
              <div>
                <div class="flex items-center justify-center gap-3 mb-8">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-indigo-600 dark:text-indigo-400">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="2" y1="12" x2="22" y2="12"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                  <h2 class="text-3xl font-bold text-gray-800 dark:text-white transition-colors">{{ t.setup.language.title }}</h2>
                </div>
                <p class="text-gray-500 dark:text-gray-400 mb-8">{{ t.setup.language.description }}</p>
                <div class="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <button
                    v-for="locale in availableLocales"
                    :key="locale.code"
                    @click="selectLanguage(locale.code)"
                    class="p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105"
                    :class="formData.language === locale.code
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-lg'
                      : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'"
                  >
                    <div class="text-2xl mb-2">{{ locale.flag || '🌐' }}</div>
                    <div class="font-bold text-gray-800 dark:text-white">{{ locale.nativeName }}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ locale.name }}</div>
                  </button>
                </div>
              </div>
            </transition>
          </div>
          
          <!-- 步骤2: 欢迎 -->
          <div v-else-if="currentStep === 2">
            <div class="text-6xl mb-6">🎉</div>
            <h1 class="text-3xl font-bold text-gray-800 dark:text-white mb-4">{{ t.setup.welcome.title }}</h1>
            <p class="text-gray-500 dark:text-gray-400 leading-relaxed whitespace-pre-line">
              {{ t.setup.welcome.description }}
            </p>
          </div>

          <!-- 步骤3: 存储配置 -->
          <div v-else-if="currentStep === 3" class="w-full">
            <transition name="slide-up" appear>
              <div>
                <div class="flex items-center justify-center gap-3 mb-8">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-indigo-600 dark:text-indigo-400">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                    <line x1="12" y1="22.08" x2="12" y2="12"/>
                  </svg>
                  <h2 class="text-3xl font-bold text-gray-800 dark:text-white transition-colors">{{ t.setup.storage.title }}</h2>
                </div>
                
                <div class="space-y-6 text-left max-w-xl mx-auto">
                  <transition name="slide-left" appear>
                    <div class="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-200 dark:border-gray-600 transition-all hover:shadow-lg">
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                        </svg>
                        {{ t.setup.storage.dbPath }}
                      </label>
                      <div class="flex gap-2">
                        <input v-model="formData.dbPath" type="text" disabled class="flex-1 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-400 transition-colors">
                        <button @click="choosePath('db')" class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 font-medium">{{ t.common.select }}</button>
                      </div>
                    </div>
                  </transition>
                  
                  <transition name="slide-left" appear :style="{ transitionDelay: '0.1s' }">
                    <div class="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-200 dark:border-gray-600 transition-all hover:shadow-lg">
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                        </svg>
                        {{ t.setup.storage.docPath }}
                      </label>
                      <div class="flex gap-2">
                        <input v-model="formData.docPath" type="text" disabled class="flex-1 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-400 transition-colors">
                        <button @click="choosePath('doc')" class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 font-medium">{{ t.common.select }}</button>
                      </div>
                    </div>
                  </transition>
                </div>
              </div>
            </transition>
          </div>

          <!-- 步骤4: 系统集成 -->
          <div v-else-if="currentStep === 4" class="w-full">
            <transition name="slide-up" appear>
              <div>
                <div class="flex items-center justify-center gap-3 mb-8">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-indigo-600 dark:text-indigo-400">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <line x1="9" y1="3" x2="9" y2="21"/>
                  </svg>
                  <h2 class="text-3xl font-bold text-gray-800 dark:text-white transition-colors">{{ t.setup.integration.title }}</h2>
                </div>
                <div class="bg-gray-50/80 dark:bg-gray-700/60 backdrop-blur-sm p-8 rounded-2xl border-2 border-gray-300/50 dark:border-gray-600/50 text-left max-w-xl mx-auto transition-all hover:shadow-xl">
                  <div class="flex items-center justify-between">
                    <div class="flex-1">
                      <div class="flex items-center gap-3 mb-2">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-indigo-600 dark:text-indigo-400">
                          <path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0"/>
                          <line x1="12" y1="20" x2="12.01" y2="20"/>
                        </svg>
                        <h3 class="text-xl font-bold text-gray-800 dark:text-white transition-colors">{{ t.setup.integration.autoStart }}</h3>
                      </div>
                      <p class="text-sm text-gray-600 dark:text-gray-400 ml-9 transition-colors">{{ t.setup.integration.autoStartDesc }}</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer ml-6">
                      <input type="checkbox" v-model="formData.autoStart" class="sr-only peer">
                      <div class="w-14 h-7 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600 shadow-inner"></div>
                    </label>
                  </div>
                </div>
              </div>
            </transition>
          </div>

          <!-- 步骤5: 默认格式 -->
          <div v-else-if="currentStep === 5" class="w-full">
            <transition name="slide-up" appear>
              <div>
                <div class="flex items-center justify-center gap-3 mb-8">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-indigo-600 dark:text-indigo-400">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                  <h2 class="text-3xl font-bold text-gray-800 dark:text-white transition-colors">{{ t.setup.format.title }}</h2>
                </div>
                <p class="text-gray-500 dark:text-gray-400 mb-8">{{ t.setup.format.description }}</p>
                <div class="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
                  <transition name="scale-in" appear>
                    <div 
                      @click="formData.defaultFormat = 'md'"
                      class="cursor-pointer border-2 rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95 group"
                      :class="formData.defaultFormat === 'md' ? 'border-indigo-600 bg-gray-100/80 dark:bg-gray-700/60 backdrop-blur-sm shadow-lg ring-4 ring-indigo-200/50 dark:ring-indigo-800/50' : 'border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:border-indigo-300 dark:hover:border-indigo-600'"
                    >
                      <div class="text-5xl mb-4 group-hover:scale-110 transition-transform">📝</div>
                      <h3 class="font-bold text-lg text-gray-800 dark:text-white mb-2 transition-colors">{{ t.setup.format.markdown }}</h3>
                      <div v-if="formData.defaultFormat === 'md'" class="mt-4 flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-indigo-600 dark:text-indigo-400">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </div>
                    </div>
                  </transition>

                  <transition name="scale-in" appear :style="{ transitionDelay: '0.1s' }">
                    <div 
                      @click="formData.defaultFormat = 'txt'"
                      class="cursor-pointer border-2 rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95 group"
                      :class="formData.defaultFormat === 'txt' ? 'border-indigo-600 bg-gray-100/80 dark:bg-gray-700/60 backdrop-blur-sm shadow-lg ring-4 ring-indigo-200/50 dark:ring-indigo-800/50' : 'border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:border-indigo-300 dark:hover:border-indigo-600'"
                    >
                      <div class="text-5xl mb-4 group-hover:scale-110 transition-transform">📄</div>
                      <h3 class="font-bold text-lg text-gray-800 dark:text-white mb-2 transition-colors">{{ t.setup.format.plainText }}</h3>
                      <div v-if="formData.defaultFormat === 'txt'" class="mt-4 flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-indigo-600 dark:text-indigo-400">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </div>
                    </div>
                  </transition>
                </div>
              </div>
            </transition>
          </div>

        </div>
      </transition>

      <div class="mt-8 flex justify-between items-center">
        <button 
          v-if="currentStep > 1" 
          @click="currentStep--"
          class="px-6 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl mr-2 transition-all font-medium flex items-center gap-2 group"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="group-hover:-translate-x-1 transition-transform">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          {{ t.common.previous }}
        </button>
        <div class="flex-1"></div>
        <button 
          @click="nextStep"
          :disabled="currentStep === 1 && !formData.language"
          class="px-10 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/50 font-medium flex items-center gap-2 group hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {{ currentStep === 5 ? t.common.finish : t.common.next }}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="group-hover:translate-x-1 transition-transform">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted } from 'vue';
import { useI18n } from '../composables/useI18n';

const { t, setLocale, initLocale, getAvailableLocales } = useI18n();
const availableLocales = getAvailableLocales();

// 初始化语言（从设置加载，如果没有则使用默认）
onMounted(async () => {
  try {
    const settings = await window.api.getSettings();
    if (settings.language) {
      formData.language = settings.language;
      initLocale(settings.language);
      setLocale(settings.language);
    } else {
      // 首次使用，使用默认语言
      formData.language = 'zh-CN';
      initLocale('zh-CN');
      setLocale('zh-CN');
    }
  } catch (e) {
    console.error('Failed to load language settings:', e);
    // 出错时使用默认语言
    formData.language = 'zh-CN';
    initLocale('zh-CN');
    setLocale('zh-CN');
  }
});

const currentStep = ref(1);
const formData = reactive({
  language: 'zh-CN', // 默认简体中文
  dbPath: '默认 (程序目录/data)', // 实际路径由后端处理，这里仅展示或选择覆盖
  docPath: '默认 (程序目录/docs)',
  autoStart: true,
  defaultFormat: 'md'
});

// 选择语言 - 立即应用并影响后续步骤
const selectLanguage = (localeCode) => {
  formData.language = localeCode;
  setLocale(localeCode);
  // 立即保存语言设置，确保后续步骤和应用界面都使用新语言
  window.api.saveSettings({ language: localeCode }).catch(err => {
    console.error('Failed to save language:', err);
  });
};

const choosePath = async (type) => {
  const path = await window.api.selectDirectory();
  if (path) {
    if (type === 'db') formData.dbPath = path;
    if (type === 'doc') formData.docPath = path;
  }
};

const nextStep = () => {
  if (currentStep.value < 5) {
    currentStep.value++;
  } else {
    // 完成设置
    window.api.completeSetup(JSON.parse(JSON.stringify(formData)));
  }
};

// 窗口控制
const minimize = () => window.api.minimize();
const maximize = () => window.api.maximize();
const closeApp = () => window.api.close();

// 监听步骤变化，添加平滑过渡
watch(currentStep, (newStep, oldStep) => {
  // 步骤变化时的额外处理（如果需要）
});
</script>

<style scoped>
/* 步骤切换动画 */
.slide-fade-enter-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* 步骤指示器动画 */
.step-bounce-enter-active {
  animation: stepBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
@keyframes stepBounce {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}

/* 进度条填充动画 */
.progress-fill-enter-active {
  transition: width 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 内容滑入动画 */
.slide-up-enter-active {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-left-enter-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-left-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

/* 弹跳进入动画 */
.bounce-in-enter-active {
  animation: bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
@keyframes bounceIn {
  0% { transform: scale(0) rotate(-180deg); opacity: 0; }
  50% { transform: scale(1.2) rotate(10deg); }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

/* 淡入动画 */
.fade-in-enter-active {
  transition: opacity 0.5s ease;
}
.fade-in-enter-from {
  opacity: 0;
}

/* 缩放进入动画 */
.scale-in-enter-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.scale-in-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

/* 慢速弹跳动画 */
@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
.animate-bounce-slow {
  animation: bounce-slow 3s ease-in-out infinite;
}
</style>
