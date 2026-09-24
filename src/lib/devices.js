import api from './axios'

async function getCsrfCookie() {
await api.get('/sanctum/csrf-cookie')
}

export async function fetchDevices(params = {}) {
const { data } = await api.get('/api/devices', { params })
return data
}

export async function createDevice(payload) {
await getCsrfCookie()
const { data } = await api.post('/api/devices', payload)
return data
}

export async function updateDevice(id, payload) {
await getCsrfCookie()
const { data } = await api.put(`/api/devices/${id}`, payload)
return data
}

export async function deleteDevice(id) {
await getCsrfCookie()
const { data } = await api.delete(`/api/devices/${id}`)
return data
}