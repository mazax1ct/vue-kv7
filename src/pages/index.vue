<script setup>
import { onMounted, ref } from 'vue'
import axios from 'axios'
import AdminLayout from '@/layouts/AdminLayout.vue'
import TableDateSelect from '@/components/TableDateSelect.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import moment from 'moment'
import Select from 'primevue/select'
import { FilterMatchMode } from '@primevue/core/api'

const marks = ref([])

const dt = ref(null)

const filters = ref({
  day: { value: null, matchMode: FilterMatchMode.EQUALS },
  location: { value: null, matchMode: FilterMatchMode.EQUALS },
  name: { value: null, matchMode: FilterMatchMode.EQUALS },
  position: { value: null, matchMode: FilterMatchMode.EQUALS },
  schedule_in: { value: null, matchMode: FilterMatchMode.EQUALS },
  late: { value: null, matchMode: FilterMatchMode.EQUALS },
  defect: { value: null, matchMode: FilterMatchMode.EQUALS },
  late_out: { value: null, matchMode: FilterMatchMode.EQUALS },
})

const loading = ref(false)

const dataLoaded = ref(false)

const columns = ref([
  { field: 'date', header: 'Дата' },
  { field: 'day', header: 'День недели', filter: true },
  { field: 'location', header: 'Местоположение', filter: true },
  { field: 'name', header: 'ФИО', filter: true },
  { field: 'position', header: 'Должность', filter: true },
  { field: 'schedule_in', header: 'Часы по графику', filter: true },
  { field: 'schedule_out', header: 'Часы факт' },
  { field: 'in', header: 'Приход' },
  { field: 'out', header: 'Уход' },
  { field: 'late', header: 'Опоздание', filter: true },
  { field: 'defect', header: 'Недоработка', filter: true },
  { field: 'late_out', header: 'Ранний уход', filter: true },
  { field: 'notify', header: 'Оповещение' },
])

const rangeStart = ref(new Date())

const rangeEnd = ref(new Date())

function recieveDatesRange(range) {
  rangeStart.value = range.start
  rangeEnd.value = range.end
  getMarks()
}

const daysOrder = [
  'Понедельник',
  'Вторник',
  'Среда',
  'Четверг',
  'Пятница',
  'Суббота',
  'Воскресенье',
]

const getMarks = async () => {
  loading.value = true

  try {
    const { data } = await axios.get(
      `http://localhost:3000/marks?date_gte=${moment(
        rangeStart.value,
        'DD-MM-YYYY'
      ).unix()}&date_lte=${moment(rangeEnd.value, 'DD-MM-YYYY').unix()}`
    )

    marks.value = data

    if (marks.value.length > 0) {
      columns.value.forEach((col) => {
        let uniqueValues = [...new Set(marks.value.map((obj) => obj[col.field]))]

        if (col.field === 'day') {
          uniqueValues.sort((a, b) => {
            return daysOrder.indexOf(a) - daysOrder.indexOf(b)
          })
        } else {
          uniqueValues.sort()
        }

        col.options = uniqueValues
      })

      dataLoaded.value = true
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

const exportFilteredData = () => {
    const displayedData = dt.value.processedData;
    console.log(displayedData);
    return displayedData
};

onMounted(async () => {
  await getMarks()
})
</script>

<template>
  <AdminLayout>
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
      <TableDateSelect @sendDatesRange="recieveDatesRange" :start="rangeStart" :end="rangeEnd" />

      <download-excel
        v-if="dataLoaded"
        class="btn btn-outline-success"
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
      :rows="5"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      tableStyle="min-width: 50rem"
      :globalFilterFields="['late_out']"
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
          {{ data[col.field] }}
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
</style>
