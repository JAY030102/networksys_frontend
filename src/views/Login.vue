<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import Message from 'primevue/message'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import Card  from 'primevue/card'

const auth = useAuthStore()
const router = useRouter()
const loginField = ref('')
const password = ref('')
const remember = ref(false)
const error = ref(null)
const loading = ref(false)

async function handleLogin() {
  error.value = null

  if (!remember.value) {
    error.value = 'Please check "Remember me" to continue.'
    return
  }

  if (password.value.length < 8) {
    error.value = 'Password must be at least 8 characters.'
    return
  }

  loading.value = true
  try {
    await auth.login(loginField.value, password.value, remember.value)
    router.push('/dashboard')
  } catch (e) {
    error.value = e.response?.data?.message || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 p-4">
    <Card class="w-full max-w-4xl p-0! overflow-hidden rounded-2xl shadow-xl">
      <template #content>
        <div class="grid md:grid-cols-2">
          <!-- Left: form -->
          <div class="flex flex-col justify-center px-8 py-12 md:px-12">
            <h1 class="text-2xl font-bold text-teal-600 text-center mb-6">Sign in</h1>

            <Message v-if="error" severity="error" :closable="false" class="mb-4">{{ error }}</Message>

            <form @submit.prevent="handleLogin" class="flex flex-col gap-4">
              <IconField>
                <InputIcon class="pi pi-envelope" />
                <InputText v-model="loginField" placeholder="Username or Email" class="w-full rounded-full" />
              </IconField>

              <IconField>
                <InputIcon class="pi pi-lock" />
                <Password
                  v-model="password"
                  :feedback="false"
                  toggleMask
                  placeholder="Password"
                  class="w-full"
                  inputClass="w-full rounded-full"
                />
              </IconField>

              <div class="flex items-center justify-between text-sm">
                <div class="flex items-center gap-2">
                  <Checkbox v-model="remember" inputId="remember" binary />
                  <label for="remember" class="text-gray-600">Remember me</label>
                </div>
                <router-link to="/forgot-password" class="text-gray-500 hover:text-teal-600">
                  Forgot your password?
                </router-link>
              </div>

              <Button
                type="submit"
                label="SIGN IN"
                :loading="loading"
                class="w-full rounded-full py-3 justify-center bg-teal-500 border-teal-500 hover:bg-teal-600 hover:border-teal-600"
              />
            </form>
          </div>

          <!-- Right: gradient panel -->
          <div class="hidden md:flex flex-col items-center justify-center text-center px-10 py-12 bg-linear-to-br from-teal-400 to-teal-600 text-white">
            <h2 class="text-3xl font-bold mb-4">Hello, Friend!</h2>
            <p class="text-teal-50 mb-8">
              Don't have an account yet? Register now and start your journey with us.
            </p>
            <Button
              label="SIGN UP"
              outlined
              class="rounded-full px-8 py-3 border-white text-white hover:bg-white hover:text-teal-600"
              @click="router.push('/register')"
            />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>