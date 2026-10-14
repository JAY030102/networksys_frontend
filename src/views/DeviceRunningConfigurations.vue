<script setup>
import { ref, onMounted, watch } from 'vue'
import {
fetchRunningConfigurations, fetchRunningConfigDevices,
createRunningConfiguration, updateRunningConfiguration, deleteRunningConfiguration,
} from '@/lib/deviceRunningConfiguration'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'

const toast = useToast()
const confirm = useConfirm()

const configurations = ref([])
const total = ref(0)
const loading = ref(true)
const search = ref('')
const deviceOptions = ref([])

const currentPage = ref(1)
const sortField = ref('created_at')
const sortOrder = ref(-1)
let searchTimeout = null

const dialog = ref(false)
const dialogTitle = ref('')
const editingId = ref(null)
const editingDeviceLabel = ref('')
const saving = ref(false)
const fileInput = ref(null)
const isDraggingFile = ref(false)

const emptyForm = () => ({ device_id: null, file_name: '', content: '' })
const form = ref(emptyForm())
const acceptedFileExtensions = ['.txt', '.cfg', '.conf', '.config', '.log', '.json', '.xml', '.yaml', '.yml', '.ini']
const maxFileSize = 1000000

const viewDialog = ref(false)
const viewing = ref(null)

function formatDateTime(value) {
  return value ? new Date(value).toLocaleString() : '—'
}

async function loadDeviceOptions() {
  const list = await fetchRunningConfigDevices()
  deviceOptions.value = list.map((d) => ({
    id: d.id,
    label: d.property_no ? `${d.device_name} (${d.property_no})` : d.device_name,
  }))
}

async function loadRunningConfigurations() {
  loading.value = true
  try {
    const res = await fetchRunningConfigurations({
      search: search.value.trim() || undefined,
      page: currentPage.value,
      sort_field: sortField.value,
      sort_order: sortOrder.value === 1 ? 'asc' : 'desc',
    })
    configurations.value = res.data
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function onPage(event) {
  currentPage.value = event.page + 1
  loadRunningConfigurations()
}

function onSort(event) {
  sortField.value = event.sortField
  sortOrder.value = event.sortOrder
  currentPage.value = 1
  loadRunningConfigurations()
}

watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadRunningConfigurations()
  }, 400)
})

function readConfigurationFile(file) {
  if (!file) return

  const hasAcceptedExtension = acceptedFileExtensions.some((extension) =>
    file.name.toLowerCase().endsWith(extension),
  )
  if (!hasAcceptedExtension) {
    toast.add({
      severity: 'error',
      summary: 'Unsupported file',
      detail: 'Choose a text, configuration, log, JSON, XML, YAML, or INI file.',
      life: 4000,
    })
    return
  }

  if (file.size > maxFileSize) {
    toast.add({
      severity: 'error',
      summary: 'File too large',
      detail: 'The configuration file must be 1 MB or smaller.',
      life: 4000,
    })
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    if (typeof reader.result !== 'string') {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to read the configuration file.', life: 4000 })
      return
    }
    form.value.content = reader.result
    form.value.file_name = file.name
  }
  reader.onerror = () => {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to read the configuration file.', life: 4000 })
  }
  reader.readAsText(file)
}

function onFileInputChange(event) {
  readConfigurationFile(event.target.files?.[0])
  event.target.value = ''
}

function onFileDrop(event) {
  isDraggingFile.value = false
  readConfigurationFile(event.dataTransfer?.files?.[0])
}

function removeSelectedFile() {
  form.value.file_name = ''
  form.value.content = ''
}

function openCreate() {
  dialogTitle.value = 'Add Configuration'
  editingId.value = null
  editingDeviceLabel.value = ''
  form.value = emptyForm()
  dialog.value = true
}

function openEdit(row) {
  dialogTitle.value = 'Edit Configuration'
  editingId.value = row.id
  editingDeviceLabel.value = row.device?.property_no
    ? `${row.device.device_name} (${row.device.property_no})`
    : row.device?.device_name || 'Device'
  form.value = {
    device_id: row.device_id,
    file_name: row.file_name || '',
    content: row.content,
  }
  dialog.value = true
}

function openView(row) {
  viewing.value = row
  viewDialog.value = true
}

async function saveConfiguration() {
  saving.value = true
  try {
    if (editingId.value) {
      await updateRunningConfiguration(editingId.value, form.value)
      toast.add({ severity: 'success', summary: 'Updated', detail: 'Configuration updated successfully.', life: 3000 })
    } else {
      await createRunningConfiguration(form.value)
      toast.add({ severity: 'success', summary: 'Created', detail: 'Configuration saved successfully.', life: 3000 })
    }

    dialog.value = false
    await loadRunningConfigurations()
    await loadDeviceOptions()
  } catch (e) {
    const message =
      e.response?.data?.message ||
      Object.values(e.response?.data?.errors || {}).flat().join(' ') ||
      'Save failed'
    toast.add({ severity: 'error', summary: 'Error', detail: message, life: 4000 })
  } finally {
    saving.value = false
  }
}

function confirmDelete(row) {
  confirm.require({
    message: `Delete the configuration for "${row.device?.device_name}"? This cannot be undone.`,
    header: 'Confirm Deletion',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await deleteRunningConfiguration(row.id)
        toast.add({ severity: 'success', summary: 'Deleted', detail: 'Configuration removed successfully.', life: 3000 })
        await loadRunningConfigurations()
        await loadDeviceOptions()
      } catch (e) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete configuration.', life: 4000 })
      }
    },
  })
}

onMounted(async () => {
  try {
    await loadDeviceOptions()
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load devices.', life: 4000 })
  }
  await loadRunningConfigurations()
})
</script>

<template>
  <div class="p-6">
    <Toast />
    <ConfirmDialog />

    <Card>
      <template #title>
        <div class="flex items-center justify-between flex-wrap gap-3">
          <span>Device Configurations</span>
          <div class="flex items-center gap-2">
            <IconField>
              <InputIcon class="pi pi-search" />
              <InputText v-model="search" placeholder="Search configurations..." />
            </IconField>
            <Button label="Add Configuration" icon="pi pi-plus" @click="openCreate" />
          </div>
        </div>
      </template>

      <template #content>
        <DataTable
          :value="configurations"
          :loading="loading"
          lazy
          paginator
          :rows="10"
          :totalRecords="total"
          dataKey="id"
          stripedRows
          scrollable
          removableSort
          size="small"
          class="text-sm"
          :pt="{ columnHeaderContent: { class: 'justify-center' } }"
          :sortField="sortField"
          :sortOrder="sortOrder"
          @page="onPage"
          @sort="onSort"
        >
          <template #empty>
            <p class="text-gray-500 text-center py-4">No configurations found.</p>
          </template>

          <Column header="Device">
            <template #body="{ data }">{{ data.device?.device_name || '—' }}</template>
          </Column>
          <Column header="Property No.">
            <template #body="{ data }">{{ data.device?.property_no || '—' }}</template>
          </Column>
          <Column field="file_name" header="File Name" sortable>
            <template #body="{ data }">{{ data.file_name || '—' }}</template>
          </Column>
          <Column header="Configuration">
            <template #body="{ data }">
              <span class="block max-w-xs truncate font-mono text-xs text-gray-600">{{ data.content }}</span>
            </template>
          </Column>
          <Column field="created_at" header="Date Added" sortable>
            <template #body="{ data }">{{ formatDateTime(data.created_at) }}</template>
          </Column>
          <Column field="updated_at" header="Last Updated" sortable>
            <template #body="{ data }">{{ formatDateTime(data.updated_at) }}</template>
          </Column>

          <Column header="Actions" style="width: 10rem" frozen alignFrozen="right">
            <template #body="{ data }">
              <div class="flex gap-1">
                <Button icon="pi pi-eye" size="small" text @click="openView(data)" />
                <Button icon="pi pi-pencil" size="small" text @click="openEdit(data)" />
                <Button icon="pi pi-trash" size="small" text severity="danger" @click="confirmDelete(data)" />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Create / Edit -->
    <Dialog v-model:visible="dialog" modal :header="dialogTitle" class="w-full max-w-3xl">
      <form @submit.prevent="saveConfiguration" class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-sm text-gray-700">Device</label>
          <div v-if="editingId" class="text-sm text-gray-700">{{ editingDeviceLabel }}</div>
          <Select
            v-else
            v-model="form.device_id"
            :options="deviceOptions"
            optionLabel="label"
            optionValue="id"
            placeholder="Select the device this configuration belongs to"
            filter
            class="w-full"
          />
        </div>

        <template v-if="form.device_id">
          <div class="flex flex-col gap-1">
            <label class="text-sm text-gray-700">Upload configuration file</label>
            <input
              ref="fileInput"
              type="file"
              class="hidden"
              accept=".txt,.cfg,.conf,.config,.log,.json,.xml,.yaml,.yml,.ini"
              @change="onFileInputChange"
            />
            <div
              class="rounded-xl border-2 border-dashed p-6 text-center transition-colors"
              :class="isDraggingFile ? 'border-primary bg-primary-50' : 'border-surface-300 bg-surface-50'"
              @dragover.prevent="isDraggingFile = true"
              @dragleave.prevent="isDraggingFile = false"
              @drop.prevent="onFileDrop"
            >
              <i class="pi pi-cloud-upload mb-3 block text-3xl text-primary" aria-hidden="true"></i>
              <p class="mb-1 text-sm font-medium text-surface-700">
                {{ isDraggingFile ? 'Drop your file to upload' : 'Drag and drop a configuration file here' }}
              </p>
              <p class="mb-3 text-xs text-surface-500">Text, CFG, CONF, JSON, XML, YAML, or INI · up to 1 MB</p>
              <Button
                label="Browse files"
                icon="pi pi-folder-open"
                size="small"
                outlined
                type="button"
                @click="fileInput?.click()"
              />
              <div v-if="form.file_name" class="mt-4 flex items-center justify-center gap-2 text-sm text-surface-700">
                <i class="pi pi-file" aria-hidden="true"></i>
                <span class="max-w-xs truncate">{{ form.file_name }}</span>
                <Button
                  icon="pi pi-times"
                  text
                  rounded
                  size="small"
                  severity="secondary"
                  type="button"
                  aria-label="Remove uploaded file"
                  @click="removeSelectedFile"
                />
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm text-gray-700">Configuration</label>
            <Textarea
              v-model="form.content"
              rows="14"
              class="w-full font-mono text-xs"
              placeholder="Type or paste the configuration here, or upload a file above..."
            />
          </div>
        </template>

        <p v-else class="text-sm text-gray-500">Select a device to add or upload its configuration.</p>

        <div class="flex justify-end gap-2">
          <Button label="Cancel" text type="button" @click="dialog = false" />
          <Button label="Save" type="submit" :loading="saving" :disabled="!form.device_id" />
        </div>
      </form>
    </Dialog>

    <!-- View -->
    <Dialog v-model:visible="viewDialog" modal header="Device Configuration" class="w-full max-w-3xl">
      <div v-if="viewing" class="flex flex-col gap-3">
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div><span class="text-gray-500">Device:</span> {{ viewing.device?.device_name }}</div>
          <div><span class="text-gray-500">File:</span> {{ viewing.file_name || '—' }}</div>
          <div><span class="text-gray-500">Added:</span> {{ formatDateTime(viewing.created_at) }}</div>
          <div><span class="text-gray-500">Updated:</span> {{ formatDateTime(viewing.updated_at) }}</div>
        </div>
        <pre class="bg-gray-900 text-gray-100 text-xs rounded-md p-4 max-h-96 overflow-auto whitespace-pre-wrap">{{ viewing.content }}</pre>
      </div>
    </Dialog>
  </div>
</template>