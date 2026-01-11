import { ref, computed } from 'vue';
import zhCN from '../locales/zh-CN';
import zhTW from '../locales/zh-TW';
import enUS from '../locales/en-US';

// 语言映射
const locales = {
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  'en-US': enUS
};

// 当前语言（响应式）
const currentLocale = ref('zh-CN');

/**
 * 国际化 composable
 */
export function useI18n() {
  // 获取当前语言包
  const t = computed(() => {
    return locales[currentLocale.value] || locales['zh-CN'];
  });
  
  /**
   * 设置语言
   * @param {string} locale - 语言代码 ('zh-CN', 'zh-TW', 'en-US')
   */
  const setLocale = (locale) => {
    if (locales[locale]) {
      currentLocale.value = locale;
      // 保存到本地存储（如果可用）
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('app-locale', locale);
      }
    }
  };
  
  /**
   * 初始化语言（从设置或本地存储加载）
   * @param {string} locale - 语言代码
   */
  const initLocale = (locale) => {
    if (locale && locales[locale]) {
      currentLocale.value = locale;
    } else if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem('app-locale');
      if (saved && locales[saved]) {
        currentLocale.value = saved;
      }
    }
  };
  
  /**
   * 获取当前语言代码
   */
  const getLocale = () => {
    return currentLocale.value;
  };
  
  /**
   * 获取可用语言列表
   */
  const getAvailableLocales = () => {
    return [
      { code: 'zh-CN', name: '简体中文', nativeName: '简体中文' },
      { code: 'zh-TW', name: '繁体中文', nativeName: '繁體中文' },
      { code: 'en-US', name: 'English', nativeName: 'English' }
    ];
  };
  
  return {
    t,
    setLocale,
    initLocale,
    getLocale,
    getAvailableLocales
  };
}
