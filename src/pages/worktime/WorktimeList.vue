<script setup lang="ts">
import { onMounted, ref } from 'vue'

import AdminLayout from '@/layouts/AdminLayout.vue'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ColumnGroup from 'primevue/columngroup'
import Row from 'primevue/row'

import Dialog from 'primevue/dialog'
import WorktimeEditForm from '@/components/WorktimeEditForm.vue'

import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'

import { DAYS_NUM_NAMES } from '@/constants'
import type { Worktime } from '@/types/types'

import { useWorktimeStore } from '@/stores/worktime'
import { storeToRefs } from 'pinia'

const worktimeStore = useWorktimeStore() //получаем доступ к стору

const { isLoading, worktime, error } = storeToRefs(worktimeStore) //деструктуризация данных из стора

const { fetchWorktime, updateWortime } = worktimeStore

//уведомление об обновлении данных
const toast = useToast()

const notification = (severity: string, summary: string, detail: string) => {
  toast.add({ severity: severity, summary: summary, detail: detail, life: 3000 })
}

const visible = ref(false) //отметка о видимости диалога

const currentWorktime = ref<Worktime>()

const updateWorktimeDialogOnOpen = (worktime: Worktime) => {
  currentWorktime.value = worktime

  visible.value = true
}

const recieveCloseDialog = () => {
  visible.value = !visible.value
}

const recieveUpdateWorktime = async (worktime: Worktime) => {
  await updateWortime(worktime)

  notification('info', 'Информация', 'Запись обновлена')

  visible.value = false
}

//получаем данные на маунт приложения
onMounted(async () => {
  await fetchWorktime()
})
</script>

<template>
  <AdminLayout>
    <DataTable
      :value="worktime"
      responsiveLayout="scroll"
      dataKey="id"
      showGridlines
      :loading="isLoading"
      tableStyle="min-width: 50rem"
    >
      <template #empty>
        <div class="text-center">По вашему запросу ничего не найдено</div>
      </template>

      <template #loading>
        <div class="text-center">Ожидайте загрузки данных...</div>
      </template>

      <ColumnGroup type="header">
        <Row>
          <Column header="Сотрудник" />
          <Column header="Должность" />
          <Column header="Режим работы" />
          <Column class="work-time-table-table-cell">
            <template #header>
              <table class="p-datatable-table">
                <tbody class="p-datatable-tbody">
                  <tr>
                    <td><span class="p-datatable-column-title">День</span></td>
                    <td><span class="p-datatable-column-title">Начало</span></td>
                    <td><span class="p-datatable-column-title">Окончание</span></td>
                  </tr>
                </tbody>
              </table>
            </template>
          </Column>
          <Column />
        </Row>
      </ColumnGroup>

      <Column field="dept_name">
        <template #body="{ data }">
          <span v-if="data.type === 'dept'" class="font-semibold text-xl">
            {{ data.dept_name ? data.dept_name + ' (' + data.dept_device + ')' : data.dept_device }}
          </span>
          <span v-else>
            {{ data.worker_last_name + ' ' + data.worker_name + ' ' + data.worker_second_name }}
          </span>
        </template>
      </Column>

      <Column field="worker_job"></Column>

      <Column field="worktime"></Column>

      <Column field="work_intervals_short" class="work-time-table-table-cell">
        <template #body="{ data }">
          <table class="p-datatable-table">
            <tbody class="p-datatable-tbody">
              <tr v-for="row in data.work_intervals_short" :key="row.work_intervals_short">
                <td>
                  {{
                    row.work_start && row.work_end ? row.day_end !== row.day_start ? DAYS_NUM_NAMES[row.day_start] + '-' + DAYS_NUM_NAMES[row.day_end] : DAYS_NUM_NAMES[row.day_start] : ''
                  }}
                </td>
                <td>{{ row.work_start }}</td>
                <td>{{ row.work_end }}</td>
              </tr>
            </tbody>
          </table>
        </template>
      </Column>

      <Column field="id" style="width: 155px">
        <template #body="slotProps">
          <button
            label="Show"
            @click="updateWorktimeDialogOnOpen(slotProps.data)"
            class="cursor-pointer py-2 px-3 text-sm border-sky-600 border-solid border rounded-sm text-sky-600 hover:bg-sky-600 hover:text-white"
            type="button"
            title="Редактировать"
          >
            Редактировать
          </button>
        </template>
      </Column>
    </DataTable>

    <Toast />

    <Dialog
      v-model:visible="visible"
      modal
      header="Редактирование"
      :draggable="false"
      :style="{ width: '100%', maxWidth: '30rem' }"
    >
      <WorktimeEditForm
        v-if="currentWorktime"
        @sendCloseDialog="recieveCloseDialog"
        @sendUpdateWorktime="recieveUpdateWorktime"
        :worktimeItem="currentWorktime"
      />
    </Dialog>
  </AdminLayout>
</template>

<style>
.work-time-table-table-cell {
  height: 100%;
  padding: 0 !important;
  width: 364px;
}

.work-time-table-table-cell .p-datatable-table {
  height: 100%;
  max-width: 364px;
}

.work-time-table-table-cell .p-datatable-table td {
  border-right: none;
  border-top: none;
  height: 42px;
  width: 120px;
}

.work-time-table-table-cell .p-datatable-table td:first-child {
  border-left: none;
}

.work-time-table-table-cell .p-datatable-table tr:last-child td {
  border-bottom: none;
}
</style>
