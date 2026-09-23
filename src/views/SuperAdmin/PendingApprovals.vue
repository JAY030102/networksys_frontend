<script setup>
import { ref, onMounted } from 'vue'
import { fetchPendingUsers, approveUser, rejectUser } from '@/lib/auth'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Card from 'primevue/card'

const users = ref([])
const loading = ref(true)

async function load() {
  loading.value = true
  users.value = await fetchPendingUsers()
  loading.value = false
}

async function handleApprove(id) {
  await approveUser(id)
  await load()
}

async function handleReject(id) {
  await rejectUser(id)
  await load()
}

onMounted(load)
</script>

<template>
  <div class="p-6">
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