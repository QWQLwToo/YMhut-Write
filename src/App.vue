<template>
  <div class="theme-transition">
    <router-view></router-view>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useTheme } from './composables/useTheme';

const { initTheme } = useTheme();

onMounted(async () => {
  await initTheme();
});
</script>

<style>
/* 确保没有任何全局样式隐藏了内容 */
#app {
  display: block;
}

/* 主题过渡动画 */
.theme-transition,
.theme-transition * {
  transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>