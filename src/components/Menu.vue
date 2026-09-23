<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { RouterView, useRouter } from 'vue-router'
import { fetchPendingUsers } from '@/lib/auth'
import Menu from 'primevue/menu'
import Avatar from 'primevue/avatar'
import Badge from 'primevue/badge'
import Divider from 'primevue/divider'
import Button from 'primevue/button'

const auth = useAuthStore()
const router = useRouter()
const pendingCount = ref(0)

async function loadPendingCount() {
  if (auth.user?.role !== 'superadmin') return
  const users = await fetchPendingUsers()
  pendingCount.value = users.length
}

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}

const items = computed(() => [
  {
    label: 'Menu',
    items: [
      {
        label: 'Dashboard',
        icon: 'pi pi-home',
        route: '/dashboard',
      }
    ],
  },
  {
    label: 'User Management',
    items: [
      ...(auth.user?.role === 'superadmin'
        ? [{
            label: 'User Status',
            icon: 'pi pi-user-plus',
            route: '/superadmin/user-management',
          }]
        : []),
      ...(auth.user?.role === 'superadmin'
        ? [{
            label: 'Pending Approvals',
            icon: 'pi pi-user-plus',
            badge: pendingCount.value > 0 ? pendingCount.value : null,
            route: '/superadmin/pending-approvals',
          }]
        : []),{
        label: 'User Profile',
        icon: 'pi pi-user',
        route: '/profile',
      }
    ],
  },
])

onMounted(loadPendingCount)
</script>

<template>
  <div class="min-h-screen flex bg-gray-50">
    <div class="card flex">
      <Menu 
        :model="items" 
        class="w-64 h-screen rounded-none border-r border-y-0 border-l-0 flex flex-col py-0!"
      >
        <template #start>
          <span class="inline-flex items-center gap-2 px-4 py-4">
            <i class="pi pi-shield text-teal-600 text-xl"></i>
            <span class="text-lg font-semibold">Network<span class="text-teal-600">Sys</span></span>
          </span>
          <Divider class="my-0!" />
        </template>

        <template #submenulabel="{ item }">
          <span class="text-teal-600 font-bold text-xs uppercase tracking-wide px-2">{{ item.label }}</span>
        </template>

        <template #item="{ item }">
          <router-link 
            v-if="item.route" 
            v-slot="{ href, navigate, isActive }" 
            :to="item.route" 
            custom
          >
            <a 
              v-ripple 
              :href="href"
              :class="[
                'flex items-center gap-2 px-4 py-2.5 mx-2 rounded-lg transition-colors cursor-pointer',
                isActive 
                  ? 'bg-teal-600 text-white font-medium shadow-xs' 
                  : 'text-gray-700 hover:bg-teal-50 hover:text-teal-700'
              ]"
              @click="navigate"
            >
              <span :class="item.icon" />
              <span>{{ item.label }}</span>
              <Badge 
                v-if="item.badge" 
                class="ml-auto" 
                :severity="isActive ? 'secondary' : 'primary'"
                :value="item.badge" 
              />
            </a>
          </router-link>
        </template>

        <template #end>
          <div class="mt-auto pb-2">
            <Divider class="my-0!" />
            <Button
              label="Logout"
              icon="pi pi-sign-out"
              text
              severity="danger"
              class="w-full justify-start! rounded-none! px-4! py-3! text-red-600 hover:bg-red-50"
              @click="handleLogout"
            />
          </div>
        </template>
      </Menu>
    </div>

    <div class="flex-1 flex flex-col">
      <RouterView />
    </div>
  </div>
</template>