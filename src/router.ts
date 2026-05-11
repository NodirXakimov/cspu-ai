import { createRouter, createWebHistory } from 'vue-router'

const ChatPage = () => import('@/pages/ChatPage.vue')
const MonitoringPage = () => import('@/pages/MonitoringPage.vue')

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'chat', component: ChatPage },
    { path: '/monitoring', name: 'monitoring', component: MonitoringPage },
    { path: '/:catchAll(.*)', redirect: '/' },
  ],
})
