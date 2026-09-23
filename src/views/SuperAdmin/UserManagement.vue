<script setup>
import { ref, onMounted } from 'vue'
import { fetchActiveUsers, fetchArchivedUsers, suspendUser, reactivateUser, terminateUser } from '@/lib/auth'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Textarea from 'primevue/textarea'


const users = ref([])
const archived = ref([])
const loadingUsers = ref(true)
const loadingArchived = ref(true)

const reasonDialog = ref(false)
const reasonAction = ref(null) // 'suspend' | 'terminate'
const reasonText = ref('')
const selectedUser = ref(null)

async function loadUsers() {
  loadingUsers.value = true
  users.value = await fetchActiveUsers()
  loadingUsers.value = false
}

async function loadArchived() {
  loadingArchived.value = true
  archived.value = await fetchArchivedUsers()
  loadingArchived.value = false
}

function openReasonDialog(user, action) {
  selectedUser.value = user
  reasonAction.value = action
  reasonText.value = ''
  reasonDialog.value = true
}

async function confirmAction() {
  if (!selectedUser.value || !reasonAction.value) return

  if (reasonAction.value === 'suspend') {
    await suspendUser(selectedUser.value.id, reasonText.value)
    await loadUsers()
  } else if (reasonAction.value === 'terminate') {
    await terminateUser(selectedUser.value.id, reasonText.value)
    await loadUsers()
    await loadArchived()
  }

  reasonDialog.value = false
}

async function handleReactivate(user) {
  await reactivateUser(user.id)
  await loadUsers()
}

onMounted(() => {
  loadUsers()
  loadArchived()
})
</script>
<template>
  <div class="p-6 flex flex-col gap-6">
    <!-- Registered Users -->
    <Card>
      <template #title>Registered Users</template>
      <template #content>
        <DataTable :value="users" :loading="loadingUsers" paginator :rows="10" dataKey="id" stripedRows>
          <template #empty>
            <p class="text-gray-500 text-center py-4">No registered users.</p>
          </template>

          <Column field="name" header="Name" sortable />
          <Column field="username" header="Username" sortable />
          <Column field="email" header="Email" sortable />
          <Column field="role" header="Role" sortable>
            <template #body="{ data }">
              <Tag :value="data.role" severity="info" class="capitalize" />
            </template>
          </Column>
          <Column field="account_status" header="Status" sortable>
            <template #body="{ data }">
              <Tag
                :value="data.account_status"
                :severity="data.account_status === 'suspended' ? 'warn' : 'success'"
                class="capitalize"
              />
            </template>
          </Column>

          <Column field="suspension_reason" header="Suspension Reason">
            <template #body="{ data }">
              <span v-if="data.account_status === 'suspended'" class="text-sm text-gray-600">
                {{ data.suspension_reason || '—' }}
              </span>
              <span v-else class="text-gray-400">—</span>
            </template>
          </Column>
          
          <Column header="Actions" style="width: 16rem">
            <template #body="{ data }">
              <div class="flex gap-2">
                <Button
                  v-if="data.account_status === 'active'"
                  label="Suspend"
                  severity="warn"
                  size="small"
                  outlined
                  @click="openReasonDialog(data, 'suspend')"
                />
                <Button
                  v-else
                  label="Reactivate"
                  severity="success"
                  size="small"
                  outlined
                  @click="handleReactivate(data)"
                />
                <Button
                  label="Terminate"
                  severity="danger"
                  size="small"
                  outlined
                  @click="openReasonDialog(data, 'terminate')"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Rejected & Terminated -->
    <Card>
      <template #title>Rejected & Terminated Users</template>
      <template #content>
        <DataTable :value="archived" :loading="loadingArchived" paginator :rows="10" dataKey="id" stripedRows>
          <template #empty>
            <p class="text-gray-500 text-center py-4">No archived users.</p>
          </template>

          <Column field="name" header="Name" sortable />
          <Column field="email" header="Email" sortable />
          <Column field="role" header="Role" sortable>
            <template #body="{ data }">
              <Tag :value="data.role" severity="info" class="capitalize" />
            </template>
          </Column>
          <Column field="archive_type" header="Type" sortable>
            <template #body="{ data }">
              <Tag
                :value="data.archive_type"
                :severity="data.archive_type === 'terminated' ? 'danger' : 'warn'"
                class="capitalize"
              />
            </template>
          </Column>
          <Column field="reason" header="Reason" />
          <Column field="actioned_at" header="Date" sortable>
            <template #body="{ data }">
              {{ new Date(data.actioned_at).toLocaleDateString() }}
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Reason dialog -->
    <Dialog v-model:visible="reasonDialog" modal :header="reasonAction === 'suspend' ? 'Suspend User' : 'Terminate User'" class="w-full max-w-md">
      <p class="text-sm text-gray-600 mb-3">
        {{ reasonAction === 'terminate'
          ? 'This will permanently remove the account and archive their data. They may register again later.'
          : 'This will temporarily restrict the account. It can be reactivated later.' }}
      </p>
      <Textarea v-model="reasonText" rows="3" class="w-full" placeholder="Reason" />
      <div class="flex justify-end gap-2 mt-4">
        <Button label="Cancel" text @click="reasonDialog = false" />
        <Button
          :label="reasonAction === 'suspend' ? 'Suspend' : 'Terminate'"
          :severity="reasonAction === 'suspend' ? 'warn' : 'danger'"
          @click="confirmAction"
        />
      </div>
    </Dialog>
  </div>
</template>