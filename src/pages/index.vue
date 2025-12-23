<script setup>
import { onMounted, ref } from 'vue'
import axios from 'axios'
import AdminLayout from '@/layouts/AdminLayout.vue'

import DataTable from 'datatables.net-vue3'
import DataTablesLib from 'datatables.net-bs5'
import 'datatables.net-buttons'
import 'datatables.net-buttons/js/buttons.html5'
import jszip from 'jszip'
import pdfmake from 'pdfmake'

DataTable.use(DataTablesLib)
DataTablesLib.Buttons.jszip(jszip)
DataTablesLib.Buttons.pdfMake(pdfmake)

const columns = [
  { data: 'date', title: 'Дата' },
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
  responsive: true,
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
    initComplete: function () {
      let api = this.api()

      console.log(api)
      /*api.columns().every(function (index) {
        var column = this
        if (index > 1 && index != 6 && index != 7) {
          var select = $(
            '<select class="form-control mt-1" style="display: block; width: auto;"><option value=""></option></select>',
          )
            .appendTo($(column.header()))
            .on('change', function () {
              var val = $.fn.dataTable.util.escapeRegex($(this).val())

              column.search(val ? '^' + val + '$' : '', true, false).draw()
            })
            .on('click', function (event) {
              event.stopPropagation()
              event.preventDefault()
            })

          column
            .data()
            .unique()
            .sort()
            .each(function (d, j) {
              select.append('<option value="' + d + '">' + d + '</option>')
            })
        }
        if (index == 1) {
          var select = $(
            '<select class="form-control mt-1" style="display: block; width: auto;"><option value=""></option></select>',
          )
            .appendTo($(column.header()))
            .on('change', function () {
              var val = $.fn.dataTable.util.escapeRegex($(this).val())

              column.search(val ? '^' + val + '$' : '', true, false).draw()
            })
            .on('click', function (event) {
              event.stopPropagation()
              event.preventDefault()
            })
          select.append('<option value="Понедельник">Понедельник</option>')
          select.append('<option value="Вторник">Вторник</option>')
          select.append('<option value="Среда">Среда</option>')
          select.append('<option value="Четверг">Четверг</option>')
          select.append('<option value="Пятница">Пятница</option>')
          select.append('<option value="Суббота">Суббота</option>')
          select.append('<option value="Воскресенье">Воскресенье</option>')
        }
      })*/
    },
  },
}

onMounted(() => {
  getMarks()
})

const marks = ref([])

const getMarks = function () {
  axios
    .get('http://localhost:3000/marks')
    .then((res) => {
      marks.value = res.data
    })
    .catch()
    .finally()
}
</script>

<template>
  <AdminLayout>
    <form class="d-flex align-items-center gap-3 mb-3" id="mainform" method="POST">
      <div class="form-group d-flex align-items-center gap-2">
        <label for="dateStart" class="text-nowrap">Дата начала:</label>
        <input
          type="input"
          class="form-control dpicker"
          id="dateStart"
          name="dateStart"
          placeholder="дд.мм.гггг"
          value="22.12.2025"
        />
      </div>

      <div class="form-group d-flex align-items-center gap-2">
        <label for="dateEnd" class="text-nowrap">Дата окончания:</label>
        <input
          type="input"
          class="form-control dpicker"
          id="dateEnd"
          name="dateEnd"
          placeholder="дд.мм.гггг"
          value="22.12.2025"
        />
      </div>

      <input name="page" id="pagerInput" value="1" type="hidden" />

      <button class="btn btn-primary" type="submit">Получить данные</button>
    </form>

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
