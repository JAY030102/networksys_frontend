<script setup>
import { useAuthStore } from '@/stores/auth'
import Avatar from 'primevue/avatar'

const auth = useAuthStore()


defineProps({
  title: {
    type: String,
    default: 'Dashboard',
  },
})
</script>

<template>
  <header class="flex items-center justify-between px-6 py-2 bg-white shadow-sm shrink-0">
    <h1 class="text-lg font-semibold text-teal-600">{{ title }}</h1>

    <div class="flex items-center gap-2">
      <Avatar shape="circle">
        <img
          v-if="auth.user?.avatar_url"
          :src="auth.user?.avatar_url"
          alt="avatar"
          class="w-full h-full object-cover rounded-full"
        />
        <i v-else class="pi pi-user"></i>
      </Avatar>
      <span class="inline-flex flex-col items-start overflow-hidden">
        <span class="font-bold text-gray-800 truncate">{{ auth.user?.first_name}} {{ auth.user?.middle_name}}{{ auth.user?.last_name }}</span>
        <span class="text-sm text-gray-500 capitalize">{{ auth.user?.role }}</span>
      </span>
    </div>
  </header>
</template>