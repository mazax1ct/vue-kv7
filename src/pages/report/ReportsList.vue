<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'

import AdminLayout from '@/layouts/AdminLayout.vue'
import TableDateSelect from '@/components/TableDateSelect.vue'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Select from 'primevue/select'
import { FilterMatchMode } from '@primevue/core/api'

import { DAYS, TIMEZONES } from '@/constants'

import type { FilterColumn, Report } from '@/types/types'

import moment from 'moment'

import { useReportsStore } from '@/stores/reports'
import { storeToRefs } from 'pinia'

const reportsStore = useReportsStore() //получаем доступ к стору

const { isLoading, isLoaded, reports, error } = storeToRefs(reportsStore) //деструктуризация данных из стора

const { fetchReports } = reportsStore

const datatable = ref(); //ссылка на таблицу

const dtPage = ref<number>(1) //стартовая страница

const dtRows = ref<number>(5) //стартовое кол-во строк таблицы

//фильтры по колонкам
const filters = ref({
  day: { value: null, matchMode: FilterMatchMode.EQUALS },
  location: { value: null, matchMode: FilterMatchMode.EQUALS },
  timezone: { value: null, matchMode: FilterMatchMode.EQUALS },
  name: { value: null, matchMode: FilterMatchMode.EQUALS },
  position: { value: null, matchMode: FilterMatchMode.EQUALS },
})

//колонки
const columns = ref<FilterColumn[]>([
  { field: 'date', header: 'Дата' },
  { field: 'day', header: 'День недели', filter: true, options: [] },
  { field: 'location', header: 'Местоположение', filter: true, options: [] },
  { field: 'timezone', header: 'Часовой пояс', filter: true, options: [] },
  { field: 'name', header: 'ФИО', filter: true, options: [] },
  { field: 'position', header: 'Должность', filter: true, options: [] },
  { field: 'check_time', header: 'Время отметки' },
  { field: 'msk_time', header: 'Время МСК' },
])

const prepareFilters = () => {
  if (isLoaded) {
    columns.value.forEach((col) => {
      //уникальные значения для фильтров
      const uniqueValues = [
        ...new Set(
          reports.value
            .map((obj: Report) => obj[col.field as keyof Report])
            .filter(v => v !== null && v !== undefined && v !== '')
        ),
      ];

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

const now = new Date();

const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

const rangeStart = ref<Date>(firstDay) //начало периода выборки

const rangeEnd = ref<Date>(new Date()) //конец периода выборки

//параметры для запроса данных (к концу периода добавляем 1 день)
const fetchReportsParams = computed(() => {
  return {
    date_gte: moment(rangeStart.value, 'DD-MM-YYYY').unix(),
    date_lte: moment(rangeEnd.value, 'DD-MM-YYYY').add(1, 'days').unix()
  }
})

//функция обновления периода выборки
const recieveDatesRange = async (range: { start: Date; end: Date }) => {
  rangeStart.value = range.start
  rangeEnd.value = range.end

  await fetchReports(fetchReportsParams.value)
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
  'Часовой пояс': {
    field: 'timezone',
    callback: (value: string) => {
      return TIMEZONES.find((timezone) => timezone.key === value)?.value
    },
  },
  ФИО: 'name',
  Должность: 'position',
  'Время отметки': 'check_time',
  'Время МСК': 'msk_time',
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

const rowStyle = (data: Report) => {
    if (data.type === 'alert') {
        return { color: 'var(--color-red-500)' };
    }
};

//получаем данные на маунт приложения
onMounted(async () => {
  await fetchReports(fetchReportsParams.value)
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
      :value="reports"
      showGridlines
      :loading="isLoading"
      paginator
      :rows="dtRows"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      tableStyle="min-width: 50rem"
      :rowStyle="rowStyle"
      sortField="date" :sortOrder="-1"
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

        <template v-else-if="col.field === 'timezone'" #body="{ data }">
          {{ TIMEZONES.find((timezone) => timezone.key === data.timezone)?.value }}
        </template>

        <template v-else #body="{ data }">
          <span>{{ data[col.field] }}</span>
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
          <template #value="slotProps">
            <div v-if="slotProps.value">
              <div>{{ col.field === 'timezone' ? TIMEZONES.find((timezone) => timezone.key === slotProps.value)?.value : slotProps.value }}</div>
            </div>
            <span v-else>
                {{ slotProps.placeholder }}
            </span>
          </template>

            <template #option="slotProps">
              <div :value="slotProps.option">{{ col.field === 'timezone' ? TIMEZONES.find((timezone) => timezone.key === slotProps.option)?.value : slotProps.option }}</div>
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
