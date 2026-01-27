import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: () => import('@/pages/MarksList.vue') },
    { path: '/report/', component: () => import('@/pages/report/ReportsList.vue') },
    { path: '/worktime/', component: () => import('@/pages/worktime/WorktimeList.vue') },
    { path: '/notice/', component: () => import('@/pages/notice/NoticesList.vue') },
  ],
})

export default router
