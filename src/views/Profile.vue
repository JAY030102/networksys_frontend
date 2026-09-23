<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { fetchProfile, updateProfile, updatePassword, updateAvatar } from '@/lib/profile'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'
import Message from 'primevue/message'
import Divider from 'primevue/divider'

const auth = useAuthStore()
const fileInput = ref(null)

function triggerFileSelect() {
  fileInput.value?.click()
}

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
  birthdate: null,
  gender: null,
  address: '',
})

const passwordForm = ref({
  current_password: '',
  password: '',
  password_confirmation: '',
})

const profileError = ref(null)
const profileSuccess = ref(null)
const passwordError = ref(null)
const passwordSuccess = ref(null)
const savingProfile = ref(false)
const savingPassword = ref(false)
const uploadingAvatar = ref(false)

function formatDate(date) {
  if (!date) return null
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

async function load() {
  const user = await fetchProfile()
  auth.user = user
  form.value = {
    first_name: user.first_name,
    middle_name: user.middle_name,
    last_name: user.last_name,
    username: user.username,
    email: user.email,
    mobile_number: user.mobile_number,
    birthdate: user.birthdate ? new Date(user.birthdate) : null,
    gender: user.gender,
    address: user.address,
  }
}

async function handleProfileSave() {
  profileError.value = null
  profileSuccess.value = null
  savingProfile.value = true
  try {
    const payload = { ...form.value, birthdate: formatDate(form.value.birthdate) }
    const res = await updateProfile(payload)
    profileSuccess.value = res.message
    auth.user = res.user
  } catch (e) {
    profileError.value =
      e.response?.data?.message ||
      Object.values(e.response?.data?.errors || {})
        .flat()
        .join(' ') ||
      'Update failed'
  } finally {
    savingProfile.value = false
  }
}

async function handlePasswordSave() {
  passwordError.value = null
  passwordSuccess.value = null
  savingPassword.value = true
  try {
    const res = await updatePassword(passwordForm.value)
    passwordSuccess.value = res.message
    passwordForm.value = { current_password: '', password: '', password_confirmation: '' }
  } catch (e) {
    passwordError.value =
      e.response?.data?.message ||
      Object.values(e.response?.data?.errors || {})
        .flat()
        .join(' ') ||
      'Password update failed'
  } finally {
    savingPassword.value = false
  }
}

async function handleAvatarChange(event) {
  const file = event.target.files[0]
  if (!file) return
  uploadingAvatar.value = true
  try {
    const res = await updateAvatar(file)
    
    // 1. Force image reload by appending a timestamp query string
    const freshAvatarUrl = `${res.avatar_url}?t=${Date.now()}`
    
    // 2. Update auth user state with new timestamped URL
    auth.user = { 
      ...auth.user, 
      ...res.user, 
      avatar_url: freshAvatarUrl 
    }
  } catch (e) {
    console.error('Avatar upload failed', e)
  } finally {
    uploadingAvatar.value = false
  }

}

onMounted(load)
</script>
<template>
  <div class="p-6 max-w-6xl mx-auto">
    <h3 class="text-xl font-semibold text-gray-800 mb-6">User Profile</h3>
    <div class="grid md:grid-cols-3 gap-6 items-start">
      <!-- Left: Profile form -->
      <Card class="md:col-span-2">
        <template #content>
          <Message v-if="profileError" severity="error" :closable="false" class="mb-4">{{ profileError }}</Message>
          <Message v-if="profileSuccess" severity="success" :closable="false" class="mb-4">{{ profileSuccess }}</Message>

          <div class="flex items-center gap-3 mb-6">
            <Avatar size="xlarge" shape="circle">
              <img
                v-if="avatarPreview || auth.user?.avatar_url"
                :src="avatarPreview || auth.user?.avatar_url"
                alt="avatar"
                class="w-full h-full object-cover rounded-full"
              />
              <span v-else>{{ auth.user?.first_name?.[0] }}{{ auth.user?.last_name?.[0] }}</span>
            </Avatar>
              <Button
              label="Change Photo"
              icon="pi pi-camera"
              size="medium"
              outlined
              :loading="uploadingAvatar"
              @click="triggerFileSelect"
            />
            
            <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleAvatarChange" />
          </div>

          <form @submit.prevent="handleProfileSave" class="flex flex-col gap-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col gap-1">
                <label class="text-sm text-gray-700">First name:</label>
                <InputText v-model="form.first_name" class="w-full" />
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-sm text-gray-700">Last name:</label>
                <InputText v-model="form.last_name" class="w-full" />
              </div>
            </div>

            <div class="flex flex-col gap-1">
              <label class="text-sm text-gray-700">Middle name:</label>
              <InputText v-model="form.middle_name" class="w-full" />
            </div>

            <div class="flex flex-col gap-1">
              <label class="text-sm text-gray-700">Email:</label>
              <InputText v-model="form.email" type="email" class="w-full" disabled />
            </div>

            <div class="flex flex-col gap-1">
              <label class="text-sm text-gray-700">Username:</label>
              <InputText v-model="form.username" class="w-full" />
            </div>

            <div class="flex flex-col gap-1">
              <label class="text-sm text-gray-700">Mobile number:</label>
              <InputText v-model="form.mobile_number" class="w-full" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col gap-1">
                <label class="text-sm text-gray-700">Birthdate:</label>
                <DatePicker v-model="form.birthdate" dateFormat="yy-mm-dd" :maxDate="new Date()" fluid />
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-sm text-gray-700">Gender:</label>
                <Select
                  v-model="form.gender"
                  :options="gender"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select"
                  class="w-full"
                />
              </div>
            </div>

            <div class="flex flex-col gap-1">
              <label class="text-sm text-gray-700">Address:</label>
              <InputText v-model="form.address" class="w-full" />
            </div>

            <Button type="submit" label="Save changes" :loading="savingProfile" class="w-fit" />
          </form>
        </template>
      </Card>

      <!-- Right: Password change -->
      <Card class="bg-yellow-50 border border-yellow-200">
        <template #content>
          <Message v-if="passwordError" severity="error" :closable="false" class="mb-4">{{ passwordError }}</Message>
          <Message v-if="passwordSuccess" severity="success" :closable="false" class="mb-4">{{ passwordSuccess }}</Message>

          <form @submit.prevent="handlePasswordSave" class="flex flex-col gap-4">
            <div class="flex flex-col gap-1">
              <label class="text-sm text-gray-700">Current password:</label>
              <Password v-model="passwordForm.current_password" :feedback="false" toggleMask class="w-full" inputClass="w-full" />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-sm text-gray-700">New password:</label>
              <Password v-model="passwordForm.password" toggleMask class="w-full" inputClass="w-full" />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-sm text-gray-700">Confirm new password:</label>
              <Password v-model="passwordForm.password_confirmation" :feedback="false" toggleMask class="w-full" inputClass="w-full" />
            </div>

            <Button type="submit" label="Update password" :loading="savingPassword" class="w-fit" />
          </form>
        </template>
      </Card>
    </div>
  </div>
</template>