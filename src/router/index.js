import { createRouter, createWebHistory, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import SidebarMenu from '@/components/Menu.vue'
const route = useRoute()

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'login', component: Login, meta: { guestOnly: true } },
  { path: '/register', name: 'register', component: Register, meta: { guestOnly: true } },
  {
    path: '/',
    component: SidebarMenu,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: 'Dashboard' },
      },
      {
        path: 'devices',
        name: 'devices',
        component: () => import('@/views/Devices.vue'),
        meta: { title: 'Devices' },
      },
      {
        path: 'superadmin/device-selections',
        name: 'device-selections',
        component: () => import('@/views/DeviceSelection.vue'),
        meta: { title: 'Device Selection', roles: ['superadmin'] },
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/views/Profile.vue'),
        meta: { title: 'My Profile' },
      },
      {
        path: 'superadmin/pending-approvals',
        name: 'pending-approvals',
        component: () => import('@/views/SuperAdmin/PendingApprovals.vue'),
        meta: { title: 'Pending Approvals' , roles: ['superadmin'] },
      },
      {
        path: 'superadmin/user-management',
        name: 'user-management',
        component: () => import('@/views/SuperAdmin/UserManagement.vue'),
        meta: { title: 'User Management' , roles: ['superadmin'] },
      },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/login' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (auth.user === null && !auth.checked) {
    await auth.fetchCurrentUser().catch(() => {})
  }

  if (to.meta.requiresAuth && !auth.user) {
    return { name: 'login' }
  }

  if (to.meta.guestOnly && auth.user) {
    return { name: 'dashboard' }
  }

  if (to.meta.roles && !to.meta.roles.includes(auth.user?.role)) {
    return { name: 'dashboard' }
  }
})

export default router