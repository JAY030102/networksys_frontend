<script setup>
import { ref, onMounted } from 'vue'
import { fetchSelections, createSelection, updateSelection, deleteSelection,
         fetchModels, createModel, updateModel, deleteModel,} from '@/lib/deviceSelection'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import { useConfirm } from 'primevue/useconfirm'
import ConfirmDialog from 'primevue/confirmdialog'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'


const categories = ref([])
const statuses = ref([])
const manufacturers = ref([])
const models = ref([])

const loading = ref({ categories: true, statuses: true, manufacturers: true, models: true })
const error = ref('')

async function loadAll() {
error.value = ''
loading.value.categories = true
loading.value.statuses = true
loading.value.manufacturers = true
loading.value.models = true
try {
categories.value = await fetchSelections('categories')
statuses.value = await fetchSelections('statuses')
manufacturers.value = await fetchSelections('manufacturers')
models.value = await fetchModels()
} finally {
loading.value.categories = false
loading.value.statuses = false
loading.value.manufacturers = false
loading.value.models = false
}
}

// --- generic dialog state for categories/statuses/manufacturers ---
const dialog = ref(false)
const dialogType = ref(null) // 'categories' | 'statuses' | 'manufacturers' | 'models'
const dialogTitle = ref('')
const editingId = ref(null)
const nameInput = ref('')
const modelManufacturerId = ref(null)

const typeMap = {
categories: { list: categories, label: 'Category' },
statuses: { list: statuses, label: 'Status' },
manufacturers: { list: manufacturers, label: 'Manufacturer' },
}

const toast = useToast()
const confirm = useConfirm()

function confirmDelete(type, id, label = 'this item') {
  confirm.require({
    message: `Are you sure you want to delete ${label}? This cannot be undone.`,
    header: 'Confirm Deletion',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: () => handleDelete(type, id),
  })
}

function openCreate(type) {
dialogType.value = type
dialogTitle.value = `Add ${typeMap[type].label}`
editingId.value = null
nameInput.value = ''
dialog.value = true
}

function openEdit(type, row) {
dialogType.value = type
dialogTitle.value = `Edit ${typeMap[type].label}`
editingId.value = row.id
nameInput.value = row.name
dialog.value = true
}

function openCreateModel() {
dialogType.value = 'models'
dialogTitle.value = 'Add Model'
editingId.value = null
nameInput.value = ''
modelManufacturerId.value = null
dialog.value = true
}

function openEditModel(row) {
dialogType.value = 'models'
dialogTitle.value = 'Edit Model'
editingId.value = row.id
nameInput.value = row.name
modelManufacturerId.value = row.manufacturer_id
dialog.value = true
}

async function saveDialog() {
  error.value = ''
  try {
    const isEditing = !!editingId.value

    if (dialogType.value === 'models') {
      if (!modelManufacturerId.value || !nameInput.value.trim()) return
      if (isEditing) {
        await updateModel(editingId.value, modelManufacturerId.value, nameInput.value)
      } else {
        await createModel(modelManufacturerId.value, nameInput.value)
      }
      models.value = await fetchModels()
    } else {
      if (!nameInput.value.trim()) return
      if (isEditing) {
        await updateSelection(dialogType.value, editingId.value, nameInput.value)
      } else {
        await createSelection(dialogType.value, nameInput.value)
      }
      typeMap[dialogType.value].list.value = await fetchSelections(dialogType.value)
    }

    toast.add({
      severity: 'success',
      summary: isEditing ? 'Updated' : 'Created',
      detail: `${nameInput.value} was ${isEditing ? 'updated' : 'added'} successfully.`,
      life: 3000,
    })

    dialog.value = false
  } catch (e) {
    error.value = e.response?.data?.message
      || Object.values(e.response?.data?.errors || {}).flat().join(' ')
      || 'Save failed'

    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.value,
      life: 4000,
    })
  }
}

async function handleDelete(type, id) {
  try {
    if (type === 'models') {
      await deleteModel(id)
      models.value = await fetchModels()
    } else {
      await deleteSelection(type, id)
      typeMap[type].list.value = await fetchSelections(type)
    }
    toast.add({ severity: 'success', summary: 'Deleted', detail: 'Item removed successfully.', life: 3000 })
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete item.', life: 4000 })
  }
}

onMounted(loadAll)
</script>

<template>
<div class="p-6 flex flex-col gap-6">
<Toast />
<ConfirmDialog />

<div class="grid md:grid-cols-2 gap-6">
    <!-- Categories -->
    <Card>
    <template #title>
        <div class="flex items-center justify-between">
        <span>Categories</span>
        <Button label="Add" icon="pi pi-plus" size="small" @click="openCreate('categories')" />
        </div>
    </template>
    <template #content>
        <DataTable :value="categories" :loading="loading.categories" paginator :rows="5" dataKey="id" stripedRows>
        <template #empty><p class="text-gray-500 text-center py-4">No categories yet.</p></template>
        <Column field="name" header="Name" />
        <Column header="Actions" style="width: 8rem">
            <template #body="{ data }">
            <div class="flex gap-2">
                <Button icon="pi pi-pencil" size="small" text @click="openEdit('categories', data)" />
                <Button icon="pi pi-trash" size="small" text severity="danger" @click="confirmDelete('categories', data.id, data.name)" />
            </div>
            </template>
        </Column>
        </DataTable>
    </template>
    </Card>

    <!-- Statuses -->
    <Card>
    <template #title>
        <div class="flex items-center justify-between">
        <span>Statuses</span>
        <Button label="Add" icon="pi pi-plus" size="small" @click="openCreate('statuses')" />
        </div>
    </template>
    <template #content>
        <DataTable :value="statuses" :loading="loading.statuses" paginator :rows="5" dataKey="id" stripedRows>
        <template #empty><p class="text-gray-500 text-center py-4">No statuses yet.</p></template>
        <Column field="name" header="Name" />
        <Column header="Actions" style="width: 8rem">
            <template #body="{ data }">
            <div class="flex gap-2">
                <Button icon="pi pi-pencil" size="small" text @click="openEdit('statuses', data)" />
                <Button icon="pi pi-trash" size="small" text severity="danger" @click="confirmDelete('statuses', data.id, data.name)" />
            </div>
            </template>
        </Column>
        </DataTable>
    </template>
    </Card>

    <!-- Manufacturers -->
    <Card>
    <template #title>
        <div class="flex items-center justify-between">
        <span>Manufacturers</span>
        <Button label="Add" icon="pi pi-plus" size="small" @click="openCreate('manufacturers')" />
        </div>
    </template>
    <template #content>
        <DataTable :value="manufacturers" :loading="loading.manufacturers" paginator :rows="5" dataKey="id" stripedRows>
        <template #empty><p class="text-gray-500 text-center py-4">No manufacturers yet.</p></template>
        <Column field="name" header="Name" />
        <Column header="Actions" style="width: 8rem">
            <template #body="{ data }">
            <div class="flex gap-2">
                <Button icon="pi pi-pencil" size="small" text @click="openEdit('manufacturers', data)" />
                <Button icon="pi pi-trash" size="small" text severity="danger" @click="confirmDelete('manufacturers', data.id, data.name)" />
            </div>
            </template>
        </Column>
        </DataTable>
    </template>
    </Card>

    <!-- Models -->
    <Card>
    <template #title>
        <div class="flex items-center justify-between">
        <span>Models</span>
        <Button label="Add" icon="pi pi-plus" size="small" @click="openCreateModel" />
        </div>
    </template>
    <template #content>
        <DataTable :value="models" :loading="loading.models" paginator :rows="5" dataKey="id" stripedRows>
        <template #empty><p class="text-gray-500 text-center py-4">No models yet.</p></template>
        <Column field="name" header="Model" />
        <Column header="Manufacturer">
            <template #body="{ data }">{{ data.manufacturer?.name }}</template>
        </Column>
        <Column header="Actions" style="width: 8rem">
            <template #body="{ data }">
            <div class="flex gap-2">
                <Button icon="pi pi-pencil" size="small" text @click="openEditModel(data)" />
                <Button icon="pi pi-trash" size="small" text severity="danger" @click="confirmDelete('models', data.id, data.name)" />
            </div>
            </template>
        </Column>
        </DataTable>
    </template>
    </Card>
</div>

<!-- Shared dialog -->
<Dialog v-model:visible="dialog" modal :header="dialogTitle" class="w-full max-w-md">
    <div class="flex flex-col gap-4">
    <div v-if="dialogType === 'models'" class="flex flex-col gap-1">
        <label class="text-sm text-gray-700">Manufacturer</label>
        <Select
        v-model="modelManufacturerId"
        :options="manufacturers"
        optionLabel="name"
        optionValue="id"
        placeholder="Select manufacturer"
        class="w-full"
        />
    </div>

    <div class="flex flex-col gap-1">
        <label class="text-sm text-gray-700">{{ dialogType === 'models' ? 'Model Name' : 'Name' }}</label>
        <InputText v-model="nameInput" class="w-full" />
    </div>
    </div>

    <div class="flex justify-end gap-2 mt-6">
    <Button label="Cancel" text @click="dialog = false" />
    <Button label="Save" @click="saveDialog" />
    </div>
</Dialog>
</div>
</template>