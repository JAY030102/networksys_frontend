import axios from 'axios'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'

const api = axios.create({
  baseURL: 'http://localhost:8000', // your Laravel app URL
  withCredentials: true,            // sends the session cookie
  withXSRFToken: true,              // axios 1.x auto-attaches XSRF-TOKEN header
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const auth = useAuthStore()
      const wasLoggedIn = !!auth.user

      auth.user = null
      if (wasLoggedIn && router.currentRoute.value.name !== 'login') {
        router.push({ name: 'login', query: { expired: '1' } })
      }
    }
    return Promise.reject(error)
  }
)

export default api