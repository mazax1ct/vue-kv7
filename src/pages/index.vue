<script setup>
import { onMounted, ref } from 'vue'
import axios from 'axios'
import AdminLayout from '@/layouts/AdminLayout.vue'
import TableDateSelect from '@/components/TableDateSelect.vue'

import DataTable from 'datatables.net-vue3'
import DataTablesLib from 'datatables.net-bs5'
import 'datatables.net-buttons'
import 'datatables.net-buttons/js/buttons.html5'
import jszip from 'jszip'
import moment from 'moment'

DataTable.use(DataTablesLib)
DataTablesLib.Buttons.jszip(jszip)

const columns = [
  {
    data: 'date',
    title: 'Дата',
    render: function (data) {
      return moment.unix(data).format('DD.MM.YYYY')
    },
  },
  { data: 'day', title: 'День недели' },
  { data: 'location', title: 'Местоположение' },
  { data: 'name', title: 'ФИО' },
  { data: 'position', title: 'Должность' },
  { data: 'schedule_in', title: 'Часы по графику' },
  { data: 'schedule_out', title: 'Часы факт' },
  { data: 'in', title: 'Приход' },
  { data: 'out', title: 'Уход' },
  { data: 'late', title: 'Опоздание' },
  { data: 'defect', title: 'Недоработка' },
  { data: 'late_out', title: 'Ранний уход' },
  { data: 'notify', title: 'Оповещение' },
]

const options = {
  responsive: false,
  select: false,
  ordering: true,
  searching: false,
  oLanguage: {
    sSearchPlaceholder: 'Найти в таблице',
    sProcessing: 'Подождите...',
    sLengthMenu: 'Показать _MENU_ записей',
    sInfo: "Записи с _START_ до _END_ из <span id='total'>_TOTAL_</span> записей",
    sInfoEmpty: 'Записи с 0 до 0 из 0 записей',
    sInfoFiltered: '(отфильтровано из _MAX_ записей)',
    sInfoPostFix: '',
    sLoadingRecords: 'Загрузка записей...',
    sZeroRecords: 'Записи отсутствуют.',
    sEmptyTable: 'В таблице отсутствуют данные',
    oPaginate: {
      sFirst: 'Первая',
      sPrevious: 'Предыдущая',
      sNext: 'Следующая',
      sLast: 'Последняя',
    },
    oAria: {
      sSortAscending: ': активировать для сортировки столбца по возрастанию',
      sSortDescending: ': активировать для сортировки столбца по убыванию',
    },
    lengthLabels: {
      '-1': 'Все',
    },
  },
  pagingType: 'simple_numbers',
  lengthMenu: [10, 25, 50, -1],
  layout: {
    topEnd: 'pageLength',
    topStart: {
      buttons: [
        {
          extend: 'excel',
          text: 'Выгрузить в Excel',
          titleAttr: 'Выгрузить в Excel',
          className: 'btn btn-outline-success',
        },
      ],
    },
  },
}

const marks = ref([])

const rangeStart = ref(new Date())

const rangeEnd = ref(new Date())

function recieveDatesRange(range) {
  rangeStart.value = range.start
  rangeEnd.value = range.end
  getMarks()
}

const getMarks = async () => {
  let params = {
    date_gte: moment(rangeStart.value, 'DD-MM-YYYY').unix(),
    date_lte: moment(rangeEnd.value, 'DD-MM-YYYY').unix(),
  }

  try {
    const { data } = await axios.get(
      `http://localhost:3000/marks?date_gte=${params.date_gte}&date_lte=${params.date_lte}`,
    )

    marks.value = data
  } catch (error) {
    console.error('Failed to fetch data:', error)
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
      class="fs table table-bordered table-td-vertical-align-middle mb-0"
      :columns="columns"
      :data="marks"
      :options="options"
    >
      <thead>
        <tr>
          <th>Дата</th>
          <th>День недели</th>
          <th>Местоположение</th>
          <th>ФИО</th>
          <th>Должность</th>
          <th>Часы по графику</th>
          <th>Часы факт</th>
          <th>Приход</th>
          <th>Уход</th>
          <th>Опоздание</th>
          <th>Недоработка</th>
          <th>Ранний уход</th>
          <th>Оповещение</th>
        </tr>
      </thead>
    </DataTable>
  </AdminLayout>
</template>

<style>
@import 'datatables.net-bs5';

.page-link {
  font-size: 14px;
}
</style>
