<script setup>
import { ref, onMounted, watch, computed  } from 'vue'
import { fetchDevices, createDevice, updateDevice, deleteDevice } from '@/lib/devices'
import { fetchSelections, fetchModels } from '@/lib/deviceSelection'
import { fetchActiveUsers } from '@/lib/auth'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'

const toast = useToast()
const confirm = useConfirm()

const devices = ref([])
const total = ref(0)
const loading = ref(true)
const search = ref('')

const categories = ref([])
const statuses = ref([])
const manufacturers = ref([])
const models = ref([])
const users = ref([])

const dialog = ref(false)
const dialogTitle = ref('')
const editingId = ref(null)
const saving = ref(false)



const emptyForm = () => ({
device_name: '', category: null, status: null,
ip_address: '', mac_address: '', vlan: '',
manufacturer: null, model: '', serial_number: '',
location: '', rack: '', port: '', firmware: '',
assigned_to: null, purchase_date: null, warranty_expiry: null,
notes: '',
})

const form = ref(emptyForm())

const filteredModels = computed(() => {
if (!form.value.manufacturer) return []
const manufacturerId = manufacturers.value.find(m => m.name === form.value.manufacturer)?.id
return models.value.filter(m => m.manufacturer_id === manufacturerId)
})

function formatDate(date) {
if (!date) return null
const d = new Date(date)
return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

async function loadLookups() {
categories.value = await fetchSelections('categories')
statuses.value = await fetchSelections('statuses')
manufacturers.value = await fetchSelections('manufacturers')
models.value = await fetchModels()
users.value = await fetchActiveUsers()
}

const currentPage = ref(1)
let searchTimeout = null

async function loadDevices() {
  loading.value = true
  try {
    const res = await fetchDevices({
      search: search.value.trim() || undefined,
      page: currentPage.value,
    })
    devices.value = res.data
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function onPage(event) {
  currentPage.value = event.page + 1
  loadDevices()
}

watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadDevices()
  }, 400)
})

function openCreate() {
dialogTitle.value = 'Add Device'
editingId.value = null
form.value = emptyForm()
dialog.value = true
}

function openEdit(row) {
dialogTitle.value = 'Edit Device'
editingId.value = row.id
form.value = {
...row,
assigned_to: row.assigned_to?.id ?? null,
purchase_date: row.purchase_date ? new Date(row.purchase_date) : null,
warranty_expiry: row.warranty_expiry ? new Date(row.warranty_expiry) : null,
}
dialog.value = true
}

async function saveDevice() {
saving.value = true
try {
const payload = {
    ...form.value,
    purchase_date: formatDate(form.value.purchase_date),
    warranty_expiry: formatDate(form.value.warranty_expiry),
}

if (editingId.value) {
    await updateDevice(editingId.value, payload)
    toast.add({ severity: 'success', summary: 'Updated', detail: 'Device updated successfully.', life: 3000 })
} else {
    await createDevice(payload)
    toast.add({ severity: 'success', summary: 'Created', detail: 'Device added successfully.', life: 3000 })
}

dialog.value = false
await loadDevices()
} catch (e) {
const message = e.response?.data?.message
    || Object.values(e.response?.data?.errors || {}).flat().join(' ')
    || 'Save failed'
toast.add({ severity: 'error', summary: 'Error', detail: message, life: 4000 })
} finally {
saving.value = false
}
}

function confirmDelete(row) {
confirm.require({
message: `Are you sure you want to delete "${row.device_name}"? This cannot be undone.`,
header: 'Confirm Deletion',
icon: 'pi pi-exclamation-triangle',
acceptClass: 'p-button-danger',
accept: async () => {
    try {
    await deleteDevice(row.id)
    toast.add({ severity: 'success', summary: 'Deleted', detail: 'Device removed successfully.', life: 3000 })
    await loadDevices()
    } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete device.', life: 4000 })
    }
},
})
}

function statusSeverity(status) {
if (status === 'active') return 'success'
if (status === 'maintenance') return 'warn'
if (status === 'decommissioned') return 'danger'
return 'info'
}

function categoryColor(name) {
  return categories.value.find(c => c.name === name)?.color
}
function statusColor(name) {
  return statuses.value.find(s => s.name === name)?.color
}
onMounted(async () => {
await loadLookups()
await loadDevices()
})


</script>

<template>
<div class="p-6">
<Toast />
<ConfirmDialog />

<Card>
    <template #title>
    <div class="flex items-center justify-between flex-wrap gap-3">
        <span>Devices</span>
        <div class="flex items-center gap-2">
        <IconField>
            <InputIcon class="pi pi-search" />
            <InputText v-model="search" placeholder="Search devices..." />
        </IconField>
        <Button label="Add Device" icon="pi pi-plus" @click="openCreate" />
        </div>
    </div>
    </template>

    <template #content>
    <DataTable
        :value="devices"
        :loading="loading"
        lazy
        paginator
        :rows="10"
        :totalRecords="total"
        dataKey="id"
        stripedRows
        scrollable
        @page="onPage"
    >
        <template #empty>
        <p class="text-gray-500 text-center py-4">No devices found.</p>
        </template>

        <Column field="device_name" header="Device Name" sortable frozen />
        <Column field="category" header="Category" sortable>
        <template #body="{ data }">
            <Tag
            :value="data.category"
            :style="categoryColor(data.category) ? { backgroundColor: '#' + categoryColor(data.category), color: '#fff' } : {}"
            />
        </template>
        </Column>

        <Column field="status" header="Status" sortable>
        <template #body="{ data }">
            <Tag
            :value="data.status"
            :style="statusColor(data.status) ? { backgroundColor: '#' + statusColor(data.status), color: '#fff' } : {}"
            />
        </template>
        </Column>
        <Column field="ip_address" header="IP Address" />
        <Column field="mac_address" header="MAC Address" />
        <Column field="manufacturer" header="Manufacturer" />
        <Column field="model" header="Model" />
        <Column field="location" header="Location" />
        <Column header="Assigned To">
        <template #body="{ data }">{{ data.assigned_to?.name || '—' }}</template>
        </Column>

        <Column header="Actions" style="width: 8rem" frozen alignFrozen="right">
        <template #body="{ data }">
            <div class="flex gap-2">
            <Button icon="pi pi-pencil" size="small" text @click="openEdit(data)" />
            <Button icon="pi pi-trash" size="small" text severity="danger" @click="confirmDelete(data)" />
            </div>
        </template>
        </Column>
    </DataTable>
    </template>
</Card>

<!-- Create/Edit Dialog -->
<Dialog v-model:visible="dialog" modal :header="dialogTitle" class="w-full max-w-3xl">
    <form @submit.prevent="saveDevice" class="grid md:grid-cols-2 gap-4">
    <div class="flex flex-col gap-1">
        <label class="text-sm text-gray-700">Device Name</label>
        <InputText v-model="form.device_name" class="w-full" />
    </div>

    <div class="flex flex-col gap-1">
        <label class="text-sm text-gray-700">Category</label>
        <Select v-model="form.category" :options="categories" optionLabel="name" optionValue="name" placeholder="Select category" class="w-full" />
    </div>

    <div class="flex flex-col gap-1">
        <label class="text-sm text-gray-700">Status</label>
        <Select v-model="form.status" :options="statuses" optionLabel="name" optionValue="name" placeholder="Select status" class="w-full" />
    </div>

    <div class="flex flex-col gap-1">
        <label class="text-sm text-gray-700">IP Address</label>
        <InputText v-model="form.ip_address" class="w-full" />
    </div>

    <div class="flex flex-col gap-1">
        <label class="text-sm text-gray-700">MAC Address</label>
        <InputText v-model="form.mac_address" class="w-full" />
    </div>

    <div class="flex flex-col gap-1">
        <label class="text-sm text-gray-700">VLAN</label>
        <InputText v-model="form.vlan" class="w-full" />
    </div>

    <div class="flex flex-col gap-1">
        <label class="text-sm text-gray-700">Manufacturer</label>
        <Select v-model="form.manufacturer" :options="manufacturers" optionLabel="name" optionValue="name" placeholder="Select manufacturer" class="w-full" />
    </div>

    <div class="flex flex-col gap-1">
        <label class="text-sm text-gray-700">Model</label>
        <Select
            v-model="form.model"
            :options="filteredModels"
            optionLabel="name"
            optionValue="name"
            placeholder="Select manufacturer first"
            :disabled="!form.manufacturer"
            class="w-full"
        />
    </div>

    <div class="flex flex-col gap-1">
        <label class="text-sm text-gray-700">Serial Number</label>
        <InputText v-model="form.serial_number" class="w-full" />
    </div>

    <div class="flex flex-col gap-1">
        <label class="text-sm text-gray-700">Location</label>
        <InputText v-model="form.location" class="w-full" />
    </div>

    <div class="flex flex-col gap-1">
        <label class="text-sm text-gray-700">Rack</label>
        <InputText v-model="form.rack" class="w-full" />
    </div>

    <div class="flex flex-col gap-1">
        <label class="text-sm text-gray-700">Port</label>
        <InputText v-model="form.port" class="w-full" />
    </div>

    <div class="flex flex-col gap-1">
        <label class="text-sm text-gray-700">Firmware</label>
        <InputText v-model="form.firmware" class="w-full" />
    </div>

    <div class="flex flex-col gap-1">
        <label class="text-sm text-gray-700">Assigned To</label>
        <Select v-model="form.assigned_to" :options="users" optionLabel="name" optionValue="id" placeholder="Unassigned" showClear class="w-full" />
    </div>

    <div class="flex flex-col gap-1">
        <label class="text-sm text-gray-700">Purchase Date</label>
        <DatePicker v-model="form.purchase_date" dateFormat="yy-mm-dd" fluid />
    </div>

    <div class="flex flex-col gap-1">
        <label class="text-sm text-gray-700">Warranty Expiry</label>
        <DatePicker v-model="form.warranty_expiry" dateFormat="yy-mm-dd" fluid />
    </div>

    <div class="flex flex-col gap-1 md:col-span-2">
        <label class="text-sm text-gray-700">Notes</label>
        <Textarea v-model="form.notes" rows="3" class="w-full" />
    </div>

    <div class="md:col-span-2 flex justify-end gap-2 mt-2">
        <Button label="Cancel" text type="button" @click="dialog = false" />
        <Button label="Save" type="submit" :loading="saving" />
    </div>
    </form>
</Dialog>
</div>
</template>