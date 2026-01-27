<script setup lang="ts">
import { onMounted, ref } from 'vue'

import AdminLayout from '@/layouts/AdminLayout.vue'
import TableDateSelect from '@/components/TableDateSelect.vue'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Select from 'primevue/select'
import { FilterMatchMode } from '@primevue/core/api'

import { DAYS } from '@/constants'

import type { FilterColumn, Mark } from '@/types/types'

import moment from 'moment'

import { useMarksStore } from '@/stores/marks'
import { storeToRefs } from 'pinia'

const marksStore = useMarksStore() //получаем доступ к стору

const { isLoading, isLoaded, marks, error } = storeToRefs(marksStore) //деструктуризация данных из стора

const { fetchMarks } = marksStore

const datatable = ref(); //ссылка на таблицу

const dtPage = ref<number>(1) //стартовая страница

const dtRows = ref<number>(5) //стартовое кол-во строк таблицы

//фильтры по колонкам
const filters = ref({
  day: { value: null, matchMode: FilterMatchMode.EQUALS },
  location: { value: null, matchMode: FilterMatchMode.EQUALS },
  name: { value: null, matchMode: FilterMatchMode.EQUALS },
  position: { value: null, matchMode: FilterMatchMode.EQUALS },
  graphic: { value: null, matchMode: FilterMatchMode.EQUALS },
  late: { value: null, matchMode: FilterMatchMode.EQUALS },
  defect: { value: null, matchMode: FilterMatchMode.EQUALS },
  late_out: { value: null, matchMode: FilterMatchMode.EQUALS },
})

//колонки
const columns = ref<FilterColumn[]>([
  { field: 'date', header: 'Дата' },
  { field: 'day', header: 'День недели', filter: true, options: [] },
  { field: 'location', header: 'Местоположение', filter: true, options: [] },
  { field: 'name', header: 'ФИО', filter: true, options: [] },
  { field: 'position', header: 'Должность', filter: true, options: [] },
  { field: 'graphic', header: 'Часы по графику', filter: true, options: [] },
  { field: 'fact', header: 'Часы факт' },
  { field: 'in', header: 'Приход' },
  { field: 'out', header: 'Уход' },
  { field: 'late', header: 'Опоздание', filter: true, options: [] },
  { field: 'defect', header: 'Недоработка', filter: true, options: [] },
  { field: 'late_out', header: 'Ранний уход', filter: true, options: [] },
  { field: 'notify', header: 'Оповещение' },
])

const prepareFilters = () => {
  if (isLoaded) {
    columns.value.forEach((col) => {
      const uniqueValues = [...new Set(marks.value.map((obj: Mark) => obj[col.field as keyof Mark]))] //собираем массив уникальных значений для фильтров

      //сортировка значений для фильтров
      if (col.field === 'day') {
        uniqueValues.sort((a, b) => {
          return DAYS.indexOf(a as string) - DAYS.indexOf(b as string)
        })
      } else {
        uniqueValues.sort()
      }

      col.options = uniqueValues as [] //запись значений для фильтров
    })
  } else {
    columns.value.forEach((col) => {
      col.options = []
    })
  }
}

const rangeStart = ref(new Date()) //начало периода выборки

const rangeEnd = ref(new Date()) //конец периода выборки

//функция обновления периода выборки
const recieveDatesRange = async (range: { start: Date; end: Date }) => {
  rangeStart.value = range.start
  rangeEnd.value = range.end

  await fetchMarks(rangeStart.value, rangeEnd.value)
  prepareFilters()
}

//поля данных для экспорта
const json_fields = {
  Дата: {
    field: 'date',
    callback: (value: number) => {
      return `${moment.unix(value).format('DD.MM.YYYY')}`
    },
  },
  'День недели': 'day',
  Местоположение: 'location',
  ФИО: 'name',
  Должность: 'position',
  'Часы по графику': 'graphic',
  'Часы факт': 'fact',
  Приход: 'in',
  Уход: 'out',
  Опоздание: 'late',
  Недоработка: 'defect',
  'Ранний уход': 'late_out',
  Оповещение: 'notify',
}

//функция получения текущей страницы
const getPage = (event: { page: number }) => {
  dtPage.value = event.page + 1
}

//функция получения кол-ва строк на странице
const getRows = (event: number) => {
  dtRows.value = event
}

//подготовка массива данных для экспорта в excel с учетом постранички
const exportFilteredData = () => {
  const displayedData = datatable.value.processedData

  if (displayedData.length <= dtRows.value) {
    return displayedData.slice(0, displayedData.length)
  } else {
    return displayedData.slice(
      dtRows.value * (dtPage.value - 1),
      dtRows.value * (dtPage.value - 1) + dtRows.value,
    )
  }
}

//получаем данные на маунт приложения
onMounted(async () => {
  await fetchMarks(rangeStart.value, rangeEnd.value)
  prepareFilters()
})
</script>

<template>
  <AdminLayout>
    <div class="flex flex-wrap items-center justify-content-between gap-3 mb-3">
      <TableDateSelect @sendDatesRange="recieveDatesRange" :start="rangeStart" :end="rangeEnd" />

      <download-excel
        v-if="isLoaded"
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
      ref="datatable"
      responsiveLayout="scroll"
      dataKey="id"
      v-model:filters="filters"
      filterDisplay="row"
      :value="marks"
      showGridlines
      :loading="isLoading"
      paginator
      :rows="dtRows"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      tableStyle="min-width: 50rem"
      @page="getPage($event)"
      @update:rows="getRows($event)"
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
            {{ data[col.field] }}
            <span v-if="data.notify_list" class="text-red-500">({{ data.notify_list }})</span>
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
