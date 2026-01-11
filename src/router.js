import { createRouter, createWebHashHistory } from 'vue-router';
import SetupWizard from './views/SetupWizard.vue';
import Workspace from './views/Workspace.vue';
import Settings from './views/Settings.vue'; // 引入

const routes = [
    { path: '/', redirect: '/workspace' },
    { path: '/setup', component: SetupWizard },
    { path: '/workspace', component: Workspace },
    { path: '/settings', component: Settings }, // 注册
    { path: '/:pathMatch(.*)*', redirect: '/workspace' }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

export default router;