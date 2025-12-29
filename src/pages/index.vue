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
import { filter } from 'jszip'

const marks = ref([])

const filters = ref({
  day: { value: null, matchMode: FilterMatchMode.EQUALS },
  location: { value: null, matchMode: FilterMatchMode.EQUALS },
})

const loading = ref(false)

const columns = ref([
  { field: 'date', header: 'Дата' },
  { field: 'day', header: 'День недели', filter: true },
  { field: 'location', header: 'Местоположение', filter: true },
  { field: 'name', header: 'ФИО' },
  { field: 'position', header: 'Должность' },
  { field: 'schedule_in', header: 'Часы по графику' },
  { field: 'schedule_out', header: 'Часы факт' },
  { field: 'in', header: 'Приход' },
  { field: 'out', header: 'Уход' },
  { field: 'late', header: 'Опоздание' },
  { field: 'defect', header: 'Недоработка' },
  { field: 'late_out', header: 'Ранний уход' },
  { field: 'notify', header: 'Оповещение' },
])

const rangeStart = ref(new Date())

const rangeEnd = ref(new Date())

function recieveDatesRange(range) {
  rangeStart.value = range.start
  rangeEnd.value = range.end
  getMarks()
}

const getMarks = async () => {
  loading.value = true

  let params = {
    date_gte: moment(rangeStart.value, 'DD-MM-YYYY').unix(),
    date_lte: moment(rangeEnd.value, 'DD-MM-YYYY').unix(),
  }

  try {
    const { data } = await axios.get(
      `http://localhost:3000/marks?date_gte=${params.date_gte}&date_lte=${params.date_lte}`,
    )

    marks.value = data

    columns.value.forEach((col) => {
      let uniqueValues = [...new Set(marks.value.map((obj) => obj[col.field]))]

      col.options = uniqueValues
    })
  } catch (error) {
    console.error('Failed to fetch data:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await getMarks()
})
</script>

<template>
  <AdminLayout>
    <TableDateSelect @sendDatesRange="recieveDatesRange" :start="rangeStart" :end="rangeEnd" />

    <DataTable
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

      <template #loading class="text-center">
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
  table {
    white-space: nowrap;
  }
</style>
