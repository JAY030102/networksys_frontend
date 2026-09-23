import api from './axios'

async function getCsrfCookie() {
  await api.get('/sanctum/csrf-cookie')
}

export async function fetchProfile() {
  const { data } = await api.get('/api/profile')
  return data
}

export async function updateProfile(payload) {
  await getCsrfCookie()
  const { data } = await api.put('/api/profile', payload)
  return data
}

export async function updatePassword(payload) {
  await getCsrfCookie()
  const { data } = await api.put('/api/profile/password', payload)
  return data
}

export async function updateAvatar(file) {
  await getCsrfCookie()
  const formData = new FormData()
  formData.append('avatar', file)
  const { data } = await api.post('/api/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}