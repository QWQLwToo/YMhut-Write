<template>
  <div class="fixed top-4 left-1/2 -translate-x-1/2 z-50"
       :class="isExpanded ? 'w-[420px] h-14' : 'w-32 h-9'"
       :style="containerStyle"
       style="pointer-events: auto;">
    
    <div 
      class="bg-[#1d1d1f] text-white/90 w-full h-full rounded-full shadow-2xl flex items-center justify-between px-1 overflow-hidden backdrop-blur-xl relative"
      @mouseenter="expand"
      @mouseleave="shrink"
    >
      <div class="absolute inset-0 flex items-center justify-center"
           :style="collapsedStyle">
        <div class="flex items-center gap-2 cursor-default">
          <div class="w-1.5 h-1.5 rounded-full animate-pulse" :class="statusColor"></div>
          <span class="text-xs font-medium tracking-wide font-sans">{{ statusText }}</span>
        </div>
      </div>

      <div class="w-full flex items-center justify-between px-6"
           :style="expandedStyle">
        
        <span class="font-bold text-sm tracking-tight text-white select-none">YMhut</span>
        
        <div class="flex items-center gap-5 text-xs text-gray-400">
          <button @click="$emit('action', 'export')" class="hover:text-white transition-colors flex items-center gap-1 group" title="导出">
            <ph-export :size="18" />
            <span class="opacity-0 group-hover:opacity-100 transition-opacity w-0 group-hover:w-auto overflow-hidden text-[10px] transition-all duration-200">导出</span>
          </button>
          
          <div class="w-[1px] h-3 bg-gray-600/50"></div>
          
          <button @click="$emit('action', 'settings')" class="hover:text-white transition-colors flex items-center gap-1 group" title="设置">
            <ph-gear :size="18" />
            <span class="opacity-0 group-hover:opacity-100 transition-opacity w-0 group-hover:w-auto overflow-hidden text-[10px] transition-all duration-200">设置</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps(['status']); // Ready, Writing, Saved
const isExpanded = ref(false);

// 中文状态映射
const statusText = computed(() => {
  switch(props.status) {
    case 'Writing': return '同步中...';
    case 'Saved': return '已保存';
    default: return '就绪';
  }
});

const statusColor = computed(() => {
  switch(props.status) {
    case 'Writing': return 'bg-orange-400';
    case 'Saved': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
});

// 平滑的容器过渡动画
const containerStyle = computed(() => ({
  transition: 'width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), height 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
  transform: 'translateX(-50%)'
}));

// 折叠状态样式
const collapsedStyle = computed(() => ({
  opacity: isExpanded.value ? 0 : 1,
  pointerEvents: isExpanded.value ? 'none' : 'auto',
  transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  transform: isExpanded.value ? 'scale(0.9)' : 'scale(1)'
}));

// 展开状态样式
const expandedStyle = computed(() => ({
  opacity: isExpanded.value ? 1 : 0,
  pointerEvents: isExpanded.value ? 'auto' : 'none',
  transition: `opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1) ${isExpanded.value ? '0.15s' : '0s'}, transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) ${isExpanded.value ? '0.15s' : '0s'}`,
  transform: isExpanded.value ? 'scale(1)' : 'scale(0.9)'
}));

let timer;
const expand = () => {
  clearTimeout(timer);
  isExpanded.value = true;
};
const shrink = () => {
  timer = setTimeout(() => {
    isExpanded.value = false;
  }, 300); // 稍微延迟收起，方便操作
};
</script>

<style scoped>
/* 使用 CSS 变量和更平滑的动画曲线 */
</style>