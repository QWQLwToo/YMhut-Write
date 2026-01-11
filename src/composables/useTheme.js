import { ref } from 'vue';

const currentTheme = ref('light');

export function useTheme() {
  const applyTheme = (theme) => {
    currentTheme.value = theme;
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  };

  const initTheme = async () => {
    try {
      if (window.api) {
        const settings = await window.api.getSettings();
        const theme = settings.theme || 'light';
        applyTheme(theme);
      }
    } catch (e) {
      applyTheme('light');
    }
  };

  return {
    currentTheme,
    applyTheme,
    initTheme
  };
}
