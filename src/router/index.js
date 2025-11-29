import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '@/utils/auth'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: () => import('@/views/Login.vue'),
            meta: { title: '登录', requiresAuth: false }
        },
        {
            path: '/',
            redirect: '/activities'
        },
        {
            path: '/activities',
            name: 'activities',
            component: () => import('@/views/ActivityList.vue'),
            meta: { title: '活动列表', requiresAuth: true }
        },
        {
            path: '/activities/create',
            name: 'activity-create',
            component: () => import('@/views/ActivityForm.vue'),
            meta: { title: '创建活动', requiresAuth: true }
        },
        {
            path: '/activities/edit/:id',
            name: 'activity-edit',
            component: () => import('@/views/ActivityForm.vue'),
            meta: { title: '编辑活动', requiresAuth: true }
        },
        {
            path: '/activity-types',
            name: 'activity-types',
            component: () => import('@/views/ActivityTypes.vue'),
            meta: { title: '活动类型管理', requiresAuth: true }
        },
        {
            path: '/registrations',
            name: 'registrations',
            component: () => import('@/views/RegistrationList.vue'),
            meta: { title: '报名管理', requiresAuth: true }
        },
        {
            path: '/activities/:id/checkin-qrcode',
            name: 'checkin-qrcode',
            component: () => import('@/views/CheckInQRCode.vue'),
            meta: { title: '签到二维码', requiresAuth: true }
        }
    ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
    document.title = to.meta.title ? `${to.meta.title} - 高校学生活动管理系统` : '高校学生活动管理系统'

    const token = getToken()

    // 需要认证的路由
    if (to.meta.requiresAuth !== false) {
        if (!token) {
            next('/login')
            return
        }
    }

    // 已登录访问登录页，跳转首页
    if (to.path === '/login' && token) {
        next('/activities')
        return
    }

    next()
})

export default router
