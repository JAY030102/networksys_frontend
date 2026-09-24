<script setup>
import { ref, onMounted } from 'vue'
import { fetchPendingUsers, approveUser, rejectUser } from '@/lib/auth'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Card from 'primevue/card'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'

const toast = useToast()

const users = ref([])
const loading = ref(true)

async function load() {
  loading.value = true
  users.value = await fetchPendingUsers()
  loading.value = false
}

async function handleApprove(id) {
  try {
    await approveUser(id)
    await load()
    toast.add({ severity: 'success', summary: 'Approved', detail: 'User has been approved.', life: 3000 })
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: e.response?.data?.message || 'Approval failed.', life: 4000 })
  }
}

async function handleReject(id) {
  try {
    await rejectUser(id)
    await load()
    toast.add({ severity: 'warn', summary: 'Rejected', detail: 'User has been rejected and archived.', life: 3000 })
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: e.response?.data?.message || 'Rejection failed.', life: 4000 })
  }
}

onMounted(load)
</script>

<template>
  <div class="p-6">
    <Toast />
    <Card>
      <template #title>Pending User Approvals</template>
      <template #content>
        <DataTable
          :value="users"
          :loading="loading"
          paginator
          :rows="10"
          dataKey="id"
          stripedRows
          responsiveLayout="scroll"
        >
          <template #empty>
            <p class="text-gray-500 text-center py-4">No pending registrations.</p>
          </template>

          <Column field="name" header="Name" sortable />
          <Column field="username" header="Username" sortable />
          <Column field="email" header="Email" sortable />

          <Column field="role" header="Role" sortable>
            <template #body="{ data }">
              <Tag :value="data.role" severity="info" class="capitalize" />
            </template>
          </Column>

          <Column header="Actions" style="width: 12rem">
            <template #body="{ data }">
              <div class="flex gap-2">
                <Button label="Approve" severity="success" size="small" @click="handleApprove(data.id)" />
                <Button label="Reject" severity="danger" size="small" @click="handleReject(data.id)" />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template>