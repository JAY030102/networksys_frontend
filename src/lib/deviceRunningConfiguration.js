import api from './axios'

async function getCsrfCookie() {
await api.get('/sanctum/csrf-cookie')
}

export async function fetchRunningConfigurations(params = {}) {
const { data } = await api.get('/api/device-running-configurations', { params })
return data
}

export async function fetchRunningConfigDevices() {
const { data } = await api.get('/api/device-running-configuration-devices')
return data
}

export async function createRunningConfiguration(payload) {
await getCsrfCookie()
const { data } = await api.post('/api/device-running-configurations', payload)
return data
}

export async function updateRunningConfiguration(id, payload) {
await getCsrfCookie()
const { data } = await api.put(`/api/device-running-configurations/${id}`, payload)
return data
}

export async function deleteRunningConfiguration(id) {
await getCsrfCookie()
const { data } = await api.delete(`/api/device-running-configurations/${id}`)
return data
}