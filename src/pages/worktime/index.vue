<script setup>
import { onMounted, ref } from 'vue'

import axios from 'axios'

import AdminLayout from '@/layouts/AdminLayout.vue'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ColumnGroup from 'primevue/columngroup'
import Row from 'primevue/row'
import { API_BASE_URL, DAYS_NUM_NAMES } from '@/constants'

let depts = [] //департаменты

let workers = [] //сотрудники

const result = ref([]) //результирующий массив

const loading = ref(false) //отметка о загрузке

const columns = ref([
  { field: 'device_name' },
  { field: 'name' },
  { field: 'job' },
  { field: 'work_time' },
  { field: 'work_intervals' },
])

//получаем департаменты
const getDepts = async () => {
  loading.value = true

  try {
    const { data } = await axios.get(`${API_BASE_URL}/departments`)

    const typeAddedDepts = data.map(function (dept) {
      return {
        ...dept,
        type: 'dept',
      }
    })

    depts = typeAddedDepts
  } catch (error) {
    console.error('Failed to fetch data:', error)
  } finally {
    loading.value = false
  }
}

//получаем сотрудников
const getWorkers = async () => {
  loading.value = true

  try {
    const { data } = await axios.get(`${API_BASE_URL}/workers`)

    const typeAddedWorkers = data.map(function (worker) {
      return {
        ...worker,
        type: 'worker',
        device_name: worker.last_name + ' ' + worker.name + ' ' + worker.second_name,
      }
    })

    workers = typeAddedWorkers
  } catch (error) {
    console.error('Failed to fetch data:', error)
  } finally {
    loading.value = false
  }
}

//объединяем массивы
const makeResult = (depts, workers) => {
  let combinedArray = []

  depts.forEach((dept) => {
    combinedArray.push(dept)

    let deptWorkers = workers.filter(item => item.department_id === parseInt(dept.id))

    if (deptWorkers) {
      combinedArray.push(...deptWorkers)
    }
  })

  result.value = combinedArray
}

//получаем данные на маунт приложения
onMounted(async () => {
  await getDepts()
  await getWorkers()
  makeResult(depts, workers)
})
</script>

<template>
  <AdminLayout>
    <DataTable
      :value="result"
      responsiveLayout="scroll"
      dataKey="id"
      showGridlines
      :loading="loading"
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

      <Column field="device_name">
        <template #body="{ data }">
          <span :class="data.type === 'dept' ? 'font-semibold text-xl' : ''">
            {{ data.device_name }}
          </span>
        </template>
      </Column>

      <Column field="job"></Column>

      <Column field="work_time"></Column>

      <Column field="work_intervals" class="work-time-table-table-cell">
        <template #body="{ data }">
          <table class="p-datatable-table">
            <tbody class="p-datatable-tbody">
              <tr v-for="row of data.work_intervals">
                <td>
                  {{
                    row.day_end
                      ? DAYS_NUM_NAMES[row.day_start] + '-' + DAYS_NUM_NAMES[row.day_end]
                      : DAYS_NUM_NAMES[row.day_start]
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
            @click="noticeDialogOpen(slotProps.data.id)"
            class="cursor-pointer py-2 px-3 text-sm border-sky-600 border-solid border rounded-sm text-sky-600 hover:bg-sky-600 hover:text-white"
            type="button"
            title="Редактировать"
          >
            Редактировать
          </button>
        </template>
      </Column>
    </DataTable>
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
