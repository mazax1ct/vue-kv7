<script setup>
import { onMounted, ref } from 'vue'

import axios from 'axios'

import AdminLayout from '@/layouts/AdminLayout.vue'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ColumnGroup from 'primevue/columngroup'
import Row from 'primevue/row'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Checkbox from 'primevue/checkbox'
import HoursPeriod from '@/components/HoursPeriod.vue'
import { API_BASE_URL, DAYS_NUM_NAMES, TIMEZONES, DAYS, HOURS } from '@/constants'

const depts = ref([]) //департаменты

const workers = ref([]) //сотрудники

const result = ref([]) //результирующий массив

const loading = ref(false) //отметка о загрузке

const visible = ref(false) //отметка о видимости диалога

/*********данные для департамента*********/
const device_name = ref()
const name = ref()
const timezone = ref()
const work_time = ref()
const all_week = ref(false)
const all_week_start = ref()
const all_week_end = ref()
const day_work_time = ref([])
/*********данные для департамента*********/

/*********данные для сотрудника*********/
/*********данные для сотрудника*********/

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

    depts.value = typeAddedDepts
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

    workers.value = typeAddedWorkers
  } catch (error) {
    console.error('Failed to fetch data:', error)
  } finally {
    loading.value = false
  }
}

//объединяем массивы
const makeResult = (depts, workers) => {
  let combinedArray = []

  depts.value.forEach((dept) => {
    combinedArray.push(dept)

    let deptWorkers = workers.value.filter((item) => item.department_id === parseInt(dept.id))

    const deptWorkersWithWorkIntervals = deptWorkers.map(function (deptWorker) {
      if(typeof deptWorker.work_intervals_short !== 'object' || Object.keys(deptWorker.work_intervals_short).length === 0) {
        deptWorker.work_intervals_short = depts.value.find(item => item.id === dept.id).work_intervals_short
      }

      if(typeof deptWorker.work_intervals_full !== 'object' || Object.keys(deptWorker.work_intervals_full).length === 0) {
        deptWorker.work_intervals_full = depts.value.find(item => item.id === dept.id).work_intervals_full
      }

      return deptWorker
    })

    if (deptWorkersWithWorkIntervals) {
      combinedArray.push(...deptWorkersWithWorkIntervals)
    }
  })

  result.value = combinedArray
}

const updateDayWorkTime = (index, value) => {
  if (!day_work_time.value.indexOf(index)) {
    day_work_time.value.splice(index, 0, value)
  }
}

function recieveHoursRange(range) {
  all_week_start.value = range.start
  all_week_end.value = range.end
}

//функция обновления данных в попапе
const worktimeDialogOpen = (id, type) => {
  if (type === 'dept') {
    device_name.value = depts.value.find((item) => item.id === id).device_name
    name.value = depts.value.find((item) => item.id === id).name
    timezone.value = depts.value.find((item) => item.id === id).timezone
    work_time.value = depts.value.find((item) => item.id === id).work_time

    const workIntervalsShort = depts.value.find((item) => item.id === id).work_intervals_short
    const keys = Object.keys(workIntervalsShort)
    const emptyWorkIntervalsShort = keys.length === 0

    if (emptyWorkIntervalsShort || keys[0] === '0') {
      all_week.value = true
      all_week_start.value = workIntervalsShort[keys[0]].work_start
      all_week_end.value = workIntervalsShort[keys[0]].work_end
    } else {
      all_week.value = false
    }
  } else {
    console.log('сотрудник')
  }

  visible.value = true
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

      <Column field="work_intervals_short" class="work-time-table-table-cell">
        <template #body="{ data }">
          <table class="p-datatable-table">
            <tbody class="p-datatable-tbody">
              <tr v-for="row in data.work_intervals_short">
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
            @click="worktimeDialogOpen(slotProps.data.id, slotProps.data.type)"
            class="cursor-pointer py-2 px-3 text-sm border-sky-600 border-solid border rounded-sm text-sky-600 hover:bg-sky-600 hover:text-white"
            type="button"
            title="Редактировать"
          >
            Редактировать
          </button>
        </template>
      </Column>
    </DataTable>

    <Dialog
      v-model:visible="visible"
      modal
      header="Редактирование"
      :draggable="false"
      :style="{ width: '100%', maxWidth: '30rem' }"
    >
      <div class="mb-4">
        <label class="block mb-1" for="device_name">Код подразделения</label>

        <InputText id="device_name" type="text" v-model="device_name" size="small" fluid disabled />
      </div>

      <div class="mb-4">
        <label class="block mb-1" for="name">Подразделение</label>

        <InputText
          id="name"
          type="text"
          v-model="name"
          size="small"
          fluid
          placeholder="Укажите название подразделения"
        />
      </div>

      <div class="mb-4">
        <label class="block mb-1" for="timezone">Часовой пояс</label>

        <Select
          v-model="timezone"
          :options="TIMEZONES"
          optionLabel="value"
          optionValue="key"
          placeholder="Выберите часовой пояс"
          class="w-full"
          size="small"
          id="timezone"
        />
      </div>

      <div class="mb-4">
        <label class="block mb-1" for="work_time">Режим работы</label>

        <InputText
          id="work_time"
          type="text"
          v-model="work_time"
          size="small"
          fluid
          placeholder="Укажите режим работы, если необходимо"
        />
      </div>

      <p class="mb-2 text-sm font-semibold">Время работы</p>

      <div class="flex items-center gap-2 mb-2">
        <Checkbox v-model="all_week" :binary="true" inputId="all_week" name="all_week" value="" />
        <label for="all_week">Вся неделя</label>
      </div>

      <div v-if="all_week" class="mb-4">
        <HoursPeriod
          @sendHoursRange="recieveHoursRange"
          :start="all_week_start"
          :end="all_week_end"
          start_title="Начало рабочего дня"
          end_title="Конец рабочего дня"
          error_text="Ошибка! Время начала рабочего дня не может быть равно или больше времени конца рабочего дня!"
        />
      </div>

      <div v-else>
        <p class="mb-2 text-sm font-semibold">График по дням</p>

        <div v-for="(day, index) in DAYS" :key="index" class="mb-2">
          <div class="flex gap-2">
            <p class="w-50 font-semibold">{{ day }}</p>

            <div class="flex items-center gap-2">
              <Checkbox
                :binary="true"
                :inputId="'day_' + index"
                :name="'worktime_' + index + '_free'"
                value=""
                v-model="day_work_time[index]"
                @change="updateDayWorkTime(index, value)"
              />
              <label :for="'day_' + index">Выходной</label>
            </div>
          </div>

          <div v-if="day_work_time[index]" class="mt-2">
            <HoursPeriod
              @sendHoursRange="recieveHoursRange"
              :start="all_week_start"
              :end="all_week_end"
              start_title="Начало рабочего дня"
              end_title="Конец рабочего дня"
              error_text="Ошибка! Время начала рабочего дня не может быть равно или больше времени конца рабочего дня!"
            />
          </div>
        </div>
      </div>

      <div class="flex flex-wrap gap-2">
        <button
          class="ml-auto cursor-pointer py-2 px-3 text-sm border-slate-700 bg-slate-700 border-solid border rounded-sm text-white hover:bg-slate-600"
          type="button"
          label="Закрыть"
          @click="visible = false"
        >
          Закрыть
        </button>

        <button
          class="cursor-pointer py-2 px-3 text-sm border-sky-700 bg-sky-700 border-solid border rounded-sm text-white hover:bg-sky-600 disabled:bg-slate-200 disabled:cursor-default disabled:text-slate-700 disabled:border-slate-400"
          type="button"
          label="Сохранить"
        >
          Сохранить
        </button>
      </div>
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
