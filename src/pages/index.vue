<script setup>
import { onMounted, ref } from 'vue'

import axios from 'axios'

import AdminLayout from '@/layouts/AdminLayout.vue'
import TableDateSelect from '@/components/TableDateSelect.vue'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Select from 'primevue/select'
import { FilterMatchMode } from '@primevue/core/api'

import moment from 'moment'

const marks = ref([]) //данные для таблицы

const dt = ref(null) //ссылка на таблицу

const dtPage = ref(1) //стартовая страница

const dtRows = ref(5) //стартовое кол-во строк таблицы

const dtPageCount = ref(0) //кол-во страниц до появления данных

const filters = ref({
  //фильтры по колонкам
  day: { value: null, matchMode: FilterMatchMode.EQUALS },
  location: { value: null, matchMode: FilterMatchMode.EQUALS },
  name: { value: null, matchMode: FilterMatchMode.EQUALS },
  position: { value: null, matchMode: FilterMatchMode.EQUALS },
  graphic: { value: null, matchMode: FilterMatchMode.EQUALS },
  late: { value: null, matchMode: FilterMatchMode.EQUALS },
  defect: { value: null, matchMode: FilterMatchMode.EQUALS },
  late_out: { value: null, matchMode: FilterMatchMode.EQUALS },
})

const loading = ref(false) //отметка о загрузке

const dataLoaded = ref(false) //отметка о том что данные получены

const columns = ref([
  //колонки
  { field: 'date', header: 'Дата' },
  { field: 'day', header: 'День недели', filter: true },
  { field: 'location', header: 'Местоположение', filter: true },
  { field: 'name', header: 'ФИО', filter: true },
  { field: 'position', header: 'Должность', filter: true },
  { field: 'graphic', header: 'Часы по графику', filter: true },
  { field: 'fact', header: 'Часы факт' },
  { field: 'in', header: 'Приход' },
  { field: 'out', header: 'Уход' },
  { field: 'late', header: 'Опоздание', filter: true },
  { field: 'defect', header: 'Недоработка', filter: true },
  { field: 'late_out', header: 'Ранний уход', filter: true },
  { field: 'notify', header: 'Оповещение' },
])

const rangeStart = ref(new Date()) //начало периода выборки

const rangeEnd = ref(new Date()) //конец периода выборки

function recieveDatesRange(range) {
  //функция обновления периода выборки
  rangeStart.value = range.start
  rangeEnd.value = range.end
  getMarks()
}

const daysOrder = [
  //порядок сортировки дней в фильтре
  'Понедельник',
  'Вторник',
  'Среда',
  'Четверг',
  'Пятница',
  'Суббота',
  'Воскресенье',
]

let json_fields = {
  //поля данных для экспорта
  'Дата': {
    field: 'date',
    callback: (value) => {
      return `${moment.unix(value).format('DD.MM.YYYY')}`
    },
  },
  'День недели': 'day',
  'Местоположение': 'location',
  'ФИО': 'name',
  'Должность': 'position',
  'Часы по графику': 'graphic',
  'Часы факт': 'fact',
  'Приход': 'in',
  'Уход': 'out',
  'Опоздание': 'late',
  'Недоработка': 'defect',
  'Ранний уход': 'late_out',
  'Оповещение': 'notify',
}

const getMarks = async () => {
  //получение данных
  loading.value = true

  try {
    const { data } = await axios.get(
      `http://localhost:3000/marks?date_gte=${moment(
        rangeStart.value,
        'DD-MM-YYYY',
      ).unix()}&date_lte=${moment(rangeEnd.value, 'DD-MM-YYYY').unix()}`,
    ) //запрос данных с учётом периода TODO переделать на параметры

    marks.value = data //обновляем переменную данных для таблицы

    if (marks.value.length > 0) {
      columns.value.forEach((col) => {
        let uniqueValues = [...new Set(marks.value.map((obj) => obj[col.field]))] //собираем массив уникальных значений для фильтров

        if (col.field === 'day') {
          //сортировка значений для фильтров
          uniqueValues.sort((a, b) => {
            return daysOrder.indexOf(a) - daysOrder.indexOf(b)
          })
        } else {
          uniqueValues.sort()
        }

        col.options = uniqueValues //запись значений для фильтров
      })

      dataLoaded.value = true //отметка о том что данные получены

      dtPageCount.value = Math.ceil(marks.value.length / dtRows.value) //считаем кол-во страниц с учётом кол-ва строк на странице
    } else {
      columns.value.forEach((col) => {
        col.options = []
      })

      dataLoaded.value = false
    }
  } catch (error) {
    console.error('Failed to fetch data:', error)
  } finally {
    loading.value = false
  }
}

const getPage = (event) => {
  //функция получения текущей страницы
  dtPage.value = event.page + 1
}

const getRows = (event) => {
  //функция получения кол-ва строк на странице
  dtRows.value = event
}

const exportFilteredData = () => {
  //подготовка массива данных для экспорта в excel с учетом постранички
  const displayedData = dt.value.processedData

  if (displayedData.length <= dtRows.value) {
    return displayedData.slice(0, displayedData.length)
  } else {
    return displayedData.slice(
      dtRows.value * (dtPage.value - 1),
      dtRows.value * (dtPage.value - 1) + dtRows.value,
    )
  }
}

const onFilter = (event) => {
  //функция обновления отметки о загрузке данных при фильтрации
  if (event.filteredValue.length > 0) {
    dataLoaded.value = true
  } else {
    dataLoaded.value = false
  }
}

onMounted(async () => {
  //получаем данные на маунт приложения
  await getMarks()
})
</script>

<template>
  <AdminLayout>
    <div class="flex flex-wrap items-center justify-content-between gap-3 mb-3">
      <TableDateSelect @sendDatesRange="recieveDatesRange" :start="rangeStart" :end="rangeEnd" />

      <download-excel
        v-if="dataLoaded"
        class="cursor-pointer py-2 px-3 text-sm border-emerald-700 border-solid border rounded-sm text-emerald-700 hover:bg-emerald-700 hover:text-white"
        :fields="json_fields"
        :fetch="exportFilteredData"
        type="xlsx"
        worksheet="My Worksheet"
        name="filename.xlsx"
      >
        Выгрузить в Excel
      </download-excel>
    </div>

    <DataTable
      ref="dt"
      responsiveLayout="scroll"
      dataKey="id"
      v-model:filters="filters"
      filterDisplay="row"
      :value="marks"
      showGridlines
      :loading="loading"
      paginator
      :rows="dtRows"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      tableStyle="min-width: 50rem"
      @page="getPage($event)"
      @update:rows="getRows($event)"
      @filter="onFilter"
    >
      <template #empty>
        <div class="text-center">По вашему запросу ничего не найдено</div>
      </template>

      <template #loading>
        <div class="text-center">Ожидайте загрузки данных...</div>
      </template>

      <Column
        v-for="col of columns"
        :key="col.field"
        :field="col.field"
        :header="col.header"
        sortable
        :showFilterMenu="false"
        :filterField="col.field"
      >
        <template v-if="col.field === 'date'" #body="{ data }">
          {{ moment.unix(data[col.field]).format('DD.MM.YYYY') }}
        </template>

        <template v-else #body="{ data }">
          <span v-if="col.field === 'fact'" :class="data.fact_warning ? 'text-red-500' : ''">{{
            data[col.field]
          }}</span>
          <span v-else-if="col.field === 'in'" :class="data.in_warning ? 'text-red-500' : ''">{{
            data[col.field]
          }}</span>
          <span v-else-if="col.field === 'out'" :class="data.out_warning ? 'text-red-500' : ''">{{
            data[col.field]
          }}</span>
          <span v-else-if="col.field === 'notify'">
            {{ data[col.field]}} <span v-if="data.notify_list" class="text-red-500">({{ data.notify_list }})</span>
          </span>
          <span v-else>{{ data[col.field] }}</span>
        </template>

        <template v-if="col.filter" #filter="{ filterModel, filterCallback }">
          <Select
            v-model="filterModel.value"
            @change="filterCallback()"
            :options="col.options"
            :placeholder="col.header"
            :showClear="true"
            size="small"
          >
            <template #option="slotProps">
              <div :value="slotProps.option">{{ slotProps.option }}</div>
            </template>
          </Select>
        </template>
      </Column>
    </DataTable>
  </AdminLayout>
</template>

<style>
table th {
  white-space: nowrap;
}

.p-datatable-filter-element-container .p-select-sm .p-select-label {
  font-size: 12px;
}
</style>
