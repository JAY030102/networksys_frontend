import api from './axios'

async function getCsrfCookie() {
  await api.get('/sanctum/csrf-cookie')
}

export async function fetchSelections(type) {
  const { data } = await api.get(`/api/device-selection/${type}`)
  return data
}

export async function createSelection(type, name, color = null) {
  await getCsrfCookie()
  const { data } = await api.post(`/api/device-selection/${type}`, { name, color })
  return data
}

export async function updateSelection(type, id, name, color = null) {
  await getCsrfCookie()
  const { data } = await api.put(`/api/device-selection/${type}/${id}`, { name, color })
  return data
}

export async function deleteSelection(type, id) {
  await getCsrfCookie()
  const { data } = await api.delete(`/api/device-selection/${type}/${id}`)
  return data
}

export async function fetchModels(manufacturerId = null) {
  const { data } = await api.get('/api/device-models', {
    params: manufacturerId ? { manufacturer_id: manufacturerId } : {},
  })
  return data
}

export async function createModel(manufacturerId, name, color = null) {
  await getCsrfCookie()
  const { data } = await api.post('/api/device-models', { manufacturer_id: manufacturerId, name, color })
  return data
}

export async function updateModel(id, manufacturerId, name, color = null) {
  await getCsrfCookie()
  const { data } = await api.put(`/api/device-models/${id}`, { manufacturer_id: manufacturerId, name, color })
  return data
}

export async function deleteModel(id) {
  await getCsrfCookie()
  const { data } = await api.delete(`/api/device-models/${id}`)
  return data
}