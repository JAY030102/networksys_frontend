<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '@/lib/auth'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import DatePicker from 'primevue/datepicker';
import Card from 'primevue/card'
import Select from 'primevue/select'
import Button from 'primevue/button'
import Message from 'primevue/message'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'

const router = useRouter()
const error = ref(null)
const success = ref(null)
const loading = ref(false)

const roles = [
  { label: 'Super Admin', value: 'superadmin' },
  { label: 'Admin', value: 'admin' },
  { label: 'Staff', value: 'staff' },
]
const gender = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
  { label: 'Prefer not to say', value: 'prefer_not_to_say' },
]

const form = ref({
  first_name: '',
  middle_name: '',
  last_name: '',
  username: '',
  email: '',
  mobile_number: '',
  birthdate: '',
  gender: null,
  address: '',
  role: null,
  password: '',
  password_confirmation: '',
})

function formatDate(date) {
  if (!date) return null
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

async function handleRegister() {
  error.value = null
  success.value = null
  loading.value = true
  try {
    const payload = {
      ...form.value,
      birthdate: formatDate(form.value.birthdate),
    }
    const res = await register(payload)
    success.value = res.message
    setTimeout(() => router.push('/login'), 2000)
  } catch (e) {
    error.value = e.response?.data?.message
      || Object.values(e.response?.data?.errors || {}).flat().join(' ')
      || 'Registration failed'
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
          <!-- Left: gradient panel -->
          <div class="hidden md:flex flex-col items-center justify-center text-center px-10 py-12 bg-linear-to-br from-teal-400 to-teal-600 text-white order-2 md:order-1">
            <h2 class="text-3xl font-bold mb-4">Welcome Back!</h2>
            <p class="text-teal-50 mb-8">
              Already have an account? Sign in to continue.
            </p>
            <Button
              label="SIGN IN"
              outlined
              class="rounded-full px-8 py-3 border-white text-white hover:bg-white hover:text-teal-600"
              @click="router.push('/login')"
            />
          </div>

          <!-- Right: form -->
          <div class="flex flex-col justify-center px-8 py-12 md:px-12 order-1 md:order-2 overflow-y-auto max-h-screen">
            <h1 class="text-2xl font-bold text-teal-600 text-center mb-6">Create Account</h1>

            <Message v-if="error" severity="error" :closable="false" class="mb-4">{{ error }}</Message>
            <Message v-if="success" severity="success" :closable="false" class="mb-4">{{ success }}</Message>

            <form @submit.prevent="handleRegister" class="flex flex-col gap-4">
              <div class="grid grid-cols-2 gap-3">
                <IconField>
                  <InputIcon class="pi pi-user" />
                  <InputText v-model="form.first_name" placeholder="First Name" class="w-full rounded-full" />
                </IconField>
                <IconField>
                  <InputIcon class="pi pi-user" />
                  <InputText v-model="form.middle_name" placeholder="Middle Name" class="w-full rounded-full" />
                </IconField>
                <IconField>
                  <InputIcon class="pi pi-user" />
                  <InputText v-model="form.last_name" placeholder="Last Name" class="w-full rounded-full" />
                </IconField>
              </div>

              <IconField>
                <InputIcon class="pi pi-at" />
                <InputText v-model="form.username" placeholder="Username" class="w-full rounded-full" />
              </IconField>

              <IconField>
                <InputIcon class="pi pi-envelope" />
                <InputText v-model="form.email" type="email" placeholder="Email" class="w-full rounded-full" />
              </IconField>

              <IconField>
                <InputIcon class="pi pi-phone" />
                <InputText v-model="form.mobile_number" placeholder="Mobile Number" class="w-full rounded-full" />
              </IconField>

        <IconField class="w-full">
        <InputIcon class="pi pi-users" />
        <Select
            v-model="form.role"
            :options="roles"
            optionLabel="label"
            optionValue="value"
            placeholder="Select Role"
            fluid
            :pt="{ 
            root: { class: '!rounded-full' }, 
            label: { class: 'pl-10' } 
            }"
        />
        </IconField>

        <IconField class="w-full">
        <InputIcon class="pi pi-calendar" />
        <DatePicker
        v-model="form.birthdate"
        placeholder="Birthdate"
        dateFormat="yy-mm-dd"
        :maxDate="new Date()"
        fluid
        :pt="{ 
            root: { class: '!rounded-full' }, 
            label: { class: 'pl-10' } 
        }"
/>
        </IconField>

        <IconField class="w-full">
        <InputIcon class="pi pi-mars" />
        <Select
            v-model="form.gender"
            :options="gender"
            optionLabel="label"
            optionValue="value"
            placeholder="Select gender"
            fluid
            :pt="{ 
            root: { class: '!rounded-full' }, 
            label: { class: 'pl-10' } 
            }"
        />
        </IconField>


        <IconField>
        <InputIcon class="pi pi-map-marker" />
        <InputText v-model="form.address" placeholder="Address" class="w-full rounded-full" />
        </IconField>

          <IconField>
            <InputIcon class="pi pi-lock" />
            <Password
              v-model="form.password"
              toggleMask
              placeholder="Password"
              class="w-full"
              inputClass="w-full rounded-full"
            />
          </IconField>

          <IconField>
            <InputIcon class="pi pi-lock" />
            <Password
              v-model="form.password_confirmation"
              toggleMask
              :feedback="false"
              placeholder="Confirm Password"
              class="w-full"
              inputClass="w-full rounded-full"
            />
          </IconField>

          <Button
                type="submit"
                label="SIGN UP"
                :loading="loading"
                class="w-full rounded-full py-3 justify-center bg-teal-500 border-teal-500 hover:bg-teal-600 hover:border-teal-600"
              />
            </form>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>