import { createApp } from 'vue'
import './style.css'

// 捕获全局错误（忽略警告）
window.addEventListener('error', (event) => {
    // 只记录错误，忽略警告
    if (event.error && window.api && window.api.logRendererError) {
        window.api.logRendererError({
            message: event.message || event.error.message || '未知错误',
            stack: event.error.stack || '',
            source: event.filename || '',
            lineno: event.lineno || 0,
            colno: event.colno || 0
        }).catch(err => {
            console.error('Failed to log error:', err);
        });
    }
});

// 捕获未处理的Promise拒绝（忽略警告）
window.addEventListener('unhandledrejection', (event) => {
    // 只记录错误，忽略警告
    if (event.reason && window.api && window.api.logRendererError) {
        const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
        window.api.logRendererError({
            message: `未处理的Promise拒绝: ${error.message}`,
            stack: error.stack || '',
            source: '',
            lineno: 0,
            colno: 0
        }).catch(err => {
            console.error('Failed to log promise rejection:', err);
        });
    }
}); // 确保你创建了 style.css 并引入了 tailwind 指令
import App from './App.vue'
import router from './router'

// 引入 Tailwind 的基础指令
// 如果 src/style.css 还没有内容，请填入：
// @tailwind base;
// @tailwind components;
// @tailwind utilities;

const app = createApp(App)
app.use(router)
app.mount('#app')