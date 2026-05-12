import { createRouter, createWebHistory } from 'vue-router'

const ChatPage = () => import('@/pages/ChatPage.vue')
const MonitoringPage = () => import('@/pages/MonitoringPage.vue')
const TeacherDisciplinePage = () => import('@/pages/TeacherDisciplinePage.vue')
const FinanceDetailsPage = () => import('@/pages/FinanceDetailsPage.vue')
const AttendanceDetailsPage = () => import('@/pages/AttendanceDetailsPage.vue')
const PerformanceDetailsPage = () => import('@/pages/PerformanceDetailsPage.vue')

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'chat', component: ChatPage },
    { path: '/monitoring', name: 'monitoring', component: MonitoringPage },
    { path: '/monitoring/teachers',    name: 'monitoring-teachers',    component: TeacherDisciplinePage },
    { path: '/monitoring/finance',     name: 'monitoring-finance',     component: FinanceDetailsPage },
    { path: '/monitoring/attendance',  name: 'monitoring-attendance',  component: AttendanceDetailsPage },
    { path: '/monitoring/performance', name: 'monitoring-performance', component: PerformanceDetailsPage },
    { path: '/:catchAll(.*)', redirect: '/' },
  ],
})
