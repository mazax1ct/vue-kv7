<script setup>
import { onMounted, ref } from 'vue'

import axios from 'axios'

import AdminLayout from '@/layouts/AdminLayout.vue'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'

const notices = ref([]) //данные для таблицы

const loading = ref(false) //отметка о загрузке

const visible = ref(false) //отметка о видимости диалога

const start = ref()

const end = ref()

const timezones = ref([
  { value: '-1', name: 'Калининград (МСК-1)' },
  { value: '0', name: 'Москва (МСК)' },
  { value: '1', name: 'Самара (МСК+1)' },
  { value: '2', name: 'Екатеринбург (МСК+2)' },
  { value: '3', name: 'Омск (МСК+3)' },
  { value: '4', name: 'Красноярск (МСК+4)' },
  { value: '5', name: 'Иркутск (МСК+5)' },
  { value: '6', name: 'Якутск (МСК+6)' },
  { value: '7', name: 'Владивосток (МСК+7)' },
  { value: '8', name: 'Магадан (МСК+8)' },
  { value: '9', name: 'Камчатка (МСК+9)' },
])

const timezone = ref()

const hours = ref([
  '01:00',
  '02:00',
  '03:00',
  '04:00',
  '05:00',
  '06:00',
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
  '22:00',
  '23:00',
  '00:00',
])

const getNotices = async () => {
  //получение данных
  loading.value = true

  try {
    const { data } = await axios.get('http://localhost:3000/notices')

    notices.value = data //обновляем переменную данных для таблицы
  } catch (error) {
    console.error('Failed to fetch data:', error)
  } finally {
    loading.value = false
  }
}

const dialogUpdate = () => {
  //функция обновления данных в попапе
}

onMounted(async () => {
  //получаем данные на маунт приложения
  await getNotices()
})
</script>

<template>
  <AdminLayout>
    <div class="mx-auto max-w-5xl">
      <DataTable
        ref="dt"
        responsiveLayout="scroll"
        dataKey="id"
        :value="notices"
        showGridlines
        :loading="loading"
        paginator
        :rows="5"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        tableStyle="min-width: 50rem"
      >
        <template #empty>
          <div class="text-center">В системе нет записей об уведомлениях</div>
        </template>

        <template #loading>
          <div class="text-center">Ожидайте загрузки данных...</div>
        </template>

        <Column field="timezone" header="Часовой пояс"></Column>

        <Column field="start" header="Начало"></Column>

        <Column field="end" header="Окончание"></Column>

        <Column style="width: 155px">
          <template #body="slotProps">
            <button
              label="Show"
              @click="visible = true"
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
        <p class="mb-2 text-sm font-semibold">Часовой пояс</p>

        <Select
          v-model="timezone"
          :options="timezones"
          optionLabel="name"
          optionValue="value"
          placeholder="Выберите часовой пояс"
          class="w-full mb-4"
          size="small"
          @change="console.log(timezone)"
        />

        <p class="mb-2 text-sm font-semibold">Время работы</p>

        <div class="flex flex-wrap gap-4 mb-4">
          <div style="width: calc(100% / 2 - var(--spacing) * 4 / 2)">
            <p class="mb-1">Начало проверки</p>

            <Select
              v-model="start"
              :options="hours"
              placeholder="Выберите время"
              class="w-full"
              size="small"
            />
          </div>

          <div style="width: calc(100% / 2 - var(--spacing) * 4 / 2)">
            <p class="mb-1">Конец проверки</p>

            <Select
              v-model="end"
              :options="hours"
              placeholder="Выберите время"
              class="w-full"
              size="small"
            />
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            class="mr-auto cursor-pointer py-2 px-3 text-sm border-red-700 bg-red-700 border-solid border rounded-sm text-white hover:bg-red-600"
            type="button"
            label="Удалить запись"
            @click="visible = false"
          >
            Удалить запись
          </button>

          <button
            class="cursor-pointer py-2 px-3 text-sm border-slate-700 bg-slate-700 border-solid border rounded-sm text-white hover:bg-slate-600"
            type="button "
            label="Закрыть"
            @click="visible = false"
          >
            Закрыть
          </button>
          <button
            class="cursor-pointer py-2 px-3 text-sm border-sky-700 bg-sky-700 border-solid border rounded-sm text-white hover:bg-sky-600"
            type="button"
            label="Сохранить"
            @click="visible = false"
          >
            Сохранить
          </button>
        </div>
      </Dialog>
    </div>
  </AdminLayout>
</template>
