import { createRouter, createWebHistory } from 'vue-router'

const ChatPage = () => import('@/pages/ChatPage.vue')
const LateTeachersPage = () => import('@/pages/LateTeachersPage.vue')

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'chat', component: ChatPage },
    { path: '/late-teachers', name: 'late-teachers', component: LateTeachersPage },
    { path: '/:catchAll(.*)', redirect: '/' },
  ],
})
