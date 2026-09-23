import api from './axios'

async function getCsrfCookie() {
  await api.get('/sanctum/csrf-cookie')
}

async function post(url, payload) {
  await getCsrfCookie()
  const { data } = await api.post(url, payload)
  return data
}

export async function login(loginField, password, remember = false) {
  const data = await post('/api/login', { login: loginField, password, remember })
  return data.user
}

export async function register(payload) {
  return post('/api/register', payload)
}

export async function logout() {
  await post('/api/logout')
}

export async function fetchUser() {
  const { data } = await api.get('/api/me')
  return data
}

export async function fetchPendingUsers() {
  const { data } = await api.get('/api/admin/users/pending')
  return data
}

export async function fetchActiveUsers() {
  const { data } = await api.get('/api/admin/users')
  return data
}

export async function fetchArchivedUsers() {
  const { data } = await api.get('/api/admin/archived-users')
  return data
}

export async function approveUser(id) {
  return post(`/api/admin/users/${id}/approve`)
}

export async function rejectUser(id, reason = '') {
  return post(`/api/admin/users/${id}/reject`, { reason })
}

export async function suspendUser(id, reason) {
  return post(`/api/admin/users/${id}/suspend`, { reason })
}

export async function reactivateUser(id) {
  return post(`/api/admin/users/${id}/reactivate`)
}

export async function terminateUser(id, reason) {
  return post(`/api/admin/users/${id}/terminate`, { reason })
}