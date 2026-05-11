import { createRouter, createWebHistory } from 'vue-router'

const ChatPage = () => import('@/pages/ChatPage.vue')
const MonitoringPage = () => import('@/pages/MonitoringPage.vue')
const TeacherDisciplinePage = () => import('@/pages/TeacherDisciplinePage.vue')
const MonitoringStubPage = () => import('@/pages/MonitoringStubPage.vue')

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'chat', component: ChatPage },
    { path: '/monitoring', name: 'monitoring', component: MonitoringPage },
    { path: '/monitoring/teachers',    name: 'monitoring-teachers',    component: TeacherDisciplinePage },
    { path: '/monitoring/finance',     name: 'monitoring-finance',     component: MonitoringStubPage, props: { stub: 'q2' } },
    { path: '/monitoring/attendance',  name: 'monitoring-attendance',  component: MonitoringStubPage, props: { stub: 'q3' } },
    { path: '/monitoring/performance', name: 'monitoring-performance', component: MonitoringStubPage, props: { stub: 'q4' } },
    { path: '/:catchAll(.*)', redirect: '/' },
  ],
})
