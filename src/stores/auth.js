import { defineStore } from 'pinia'
import { login, fetchUser, logout } from '@/lib/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    checked: false,
  }),
  actions: {
    async login(loginField, password, remember) {
      this.user = await login(loginField, password, remember)
      this.checked = true
    },
    async fetchCurrentUser() {
      try {
        this.user = await fetchUser()
      } catch {
        this.user = null
      } finally {
        this.checked = true
      }
    },
    async logout() {
      await logout()
      this.user = null
    },
  },
})