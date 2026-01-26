import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: () => import('@/pages/index.vue') },
    { path: '/report/', component: () => import('@/pages/report/index.vue') },
    { path: '/worktime/', component: () => import('@/pages/worktime/index.vue') },
    { path: '/notice/', component: () => import('@/pages/notice/index.vue') },
  ],
})

export default router
