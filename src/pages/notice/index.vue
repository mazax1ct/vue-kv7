<script setup>
import { onMounted, ref } from 'vue'

import axios from 'axios'

import AdminLayout from '@/layouts/AdminLayout.vue'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'

//уведомление об обновлении данных
const toast = useToast()

const updateConfirmation = (severity, summary, detail) => {
  toast.add({ severity: severity, summary: summary, detail: detail, life: 3000 })
}

//попап подтверждения удаления записи
const confirm = useConfirm()

const deleteConfirm = () => {
  confirm.require({
    group: 'headless',
    header: 'Подтверждение',
    message: 'Вы уверены, что хотите удалить запись?',
  })
}

const notices = ref([]) //данные для таблицы

const loading = ref(false) //отметка о загрузке

const visible = ref(false) //отметка о видимости диалога

const currentNotice = ref(null)

const currentNoticeId = ref(null)

const start = ref() //время начала проверки

const end = ref() //время конца проверки

//таймзоны
const timezones = [
  { key: '-1', value: 'Калининград (МСК-1)' },
  { key: '0', value: 'Москва (МСК)' },
  { key: '1', value: 'Самара (МСК+1)' },
  { key: '2', value: 'Екатеринбург (МСК+2)' },
  { key: '3', value: 'Омск (МСК+3)' },
  { key: '4', value: 'Красноярск (МСК+4)' },
  { key: '5', value: 'Иркутск (МСК+5)' },
  { key: '6', value: 'Якутск (МСК+6)' },
  { key: '7', value: 'Владивосток (МСК+7)' },
  { key: '8', value: 'Магадан (МСК+8)' },
  { key: '9', value: 'Камчатка (МСК+9)' },
]

const timezone = ref() //таймзона

//часы для наполнения селектов
const hours = [
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
]

//получение данных
const getNotices = async () => {
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

const dialogHeader = ref()

//функция обновления данных в попапе
const noticeDialogOpen = (id) => {
  if (id) {
    dialogHeader.value = 'Редактирование'

    currentNotice.value = notices.value.find((notice) => notice.id === id)

    currentNoticeId.value = currentNotice.value.id
    start.value = currentNotice.value.start
    end.value = currentNotice.value.end
    timezone.value = currentNotice.value.timezone
  } else {
    dialogHeader.value = 'Создание записи'

    currentNoticeId.value = null
    start.value = null
    end.value = null
    timezone.value = null
  }

  visible.value = true
}

//удаление записи об уведомлении
const removeNotice = async (id) => {
  loading.value = true

  await getNotices()

  try {
    await axios.delete(`http://localhost:3000/notices/${id}`)

    //обнуляем значения переменных
    currentNotice.value = null
    currentNoticeId.value = null
    start.value = null
    end.value = null
    timezone.value = null

    updateConfirmation('error', 'Информация', 'Запись удалена')

    await getNotices()

    visible.value = false
  } catch (error) {
    console.error('Failed to fetch data:', error)
  } finally {
    loading.value = false
  }
}

//валидация времени начала и конца проверки
const validationError = ref(false)

const startEndValidation = () => {
  if (hours.indexOf(end.value) <= hours.indexOf(start.value)) {
    validationError.value = true
  } else {
    validationError.value = false
  }
}

//обновление записи об уведомлении
const updateNotices = async (id) => {
  loading.value = true

  await getNotices()

  if (id) {
    try {
      await axios.patch(`http://localhost:3000/notices/${id}`, {
        id: currentNoticeId.value,
        timezone: timezone.value,
        start: start.value,
        end: end.value,
      })

      await getNotices() //получаем обновленные данные после обновления записи

      updateConfirmation('info', 'Информация', 'Запись обновлена')

      visible.value = false
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      loading.value = false
    }
  } else {
    let newNoticeId = 0

    if (notices.value.length > 0) {
      newNoticeId = parseInt(notices.value.at(-1).id) + 1
    } else {
      newNoticeId = 1
    }

    const newItem = {
      id: newNoticeId,
      timezone: timezone.value,
      start: start.value,
      end: end.value,
    }

    try {
      await axios.post('http://localhost:3000/notices', newItem)

      await getNotices()

      updateConfirmation('success', 'Информация', 'Запись добавлена')

      visible.value = false
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      loading.value = false
    }
  }
}

//получаем данные на маунт приложения
onMounted(async () => {
  await getNotices()
})
</script>

<template>
  <AdminLayout>
    <div class="mx-auto max-w-5xl pt-4">
      <div class="text-right mb-4">
        <button
          class="cursor-pointer py-2 px-3 text-sm border-sky-700 bg-sky-700 border-solid border rounded-sm text-white hover:bg-sky-600"
          type="button"
          @click="noticeDialogOpen()"
        >
          Добавить уведомление
        </button>
      </div>

      <DataTable
        ref="dt"
        responsiveLayout="scroll"
        dataKey="id"
        :value="notices"
        showGridlines
        :loading="loading"
        paginator
        :rows="20"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        tableStyle="min-width: 50rem"
      >
        <template #empty>
          <div class="text-center">В системе нет записей об уведомлениях</div>
        </template>

        <template #loading>
          <div class="text-center">Ожидайте загрузки данных...</div>
        </template>

        <Column field="timezone" header="Часовой пояс">
          <template #body="slotProps">{{
            timezones.find((timezone) => timezone.key === slotProps.data.timezone).value
          }}</template>
        </Column>

        <Column field="start" header="Начало"></Column>

        <Column field="end" header="Окончание"></Column>

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

      <Toast />

      <Dialog
        v-model:visible="visible"
        modal
        :header="dialogHeader"
        :draggable="false"
        :style="{ width: '100%', maxWidth: '30rem' }"
      >
        <p class="mb-2 text-sm font-semibold">Часовой пояс</p>

        <Select
          v-model="timezone"
          :options="timezones"
          optionLabel="value"
          optionValue="key"
          placeholder="Выберите часовой пояс"
          class="w-full mb-4"
          size="small"
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
              :invalid="validationError"
              @change="startEndValidation()"
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
              :invalid="validationError"
              @change="startEndValidation()"
            />
          </div>
        </div>

        <div
          v-if="validationError"
          class="p-2 mb-4 border-solid border rounded-sm bg-red-100 border-red-800 text-red-800"
        >
          Ошибка! Время начала проверки не может быть равно или больше времени конца проверки!
        </div>

        <div class="flex flex-wrap gap-2">
          <ConfirmDialog group="headless">
            <template #container="{ message, acceptCallback, rejectCallback }">
              <div class="flex flex-col items-center p-8 bg-surface-0 dark:bg-surface-900 rounded">
                <h5 class="font-bold text-2xl block mb-2">{{ message.header }}</h5>

                <p class="mb-2">{{ message.message }}</p>

                <div class="flex items-center gap-2 mt-6">
                  <button
                    @click="removeNotice(currentNoticeId)"
                    class="cursor-pointer py-2 px-3 text-sm border-red-700 bg-red-700 border-solid border rounded-sm text-white hover:bg-red-600"
                    type="button"
                  >
                    Удалить
                  </button>

                  <button
                    @click="rejectCallback"
                    class="cursor-pointer py-2 px-3 text-sm border-slate-700 bg-slate-700 border-solid border rounded-sm text-white hover:bg-slate-600"
                    type="button"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </template>
          </ConfirmDialog>

          <button
            class="cursor-pointer py-2 px-3 text-sm border-red-700 bg-red-700 border-solid border rounded-sm text-white hover:bg-red-600"
            type="button"
            label="Удалить запись"
            v-if="currentNoticeId"
            @click="deleteConfirm()"
          >
            Удалить запись
          </button>

          <button
            class="ml-auto cursor-pointer py-2 px-3 text-sm border-slate-700 bg-slate-700 border-solid border rounded-sm text-white hover:bg-slate-600"
            type="button "
            label="Закрыть"
            @click="visible = false"
          >
            Закрыть
          </button>

          <button
            class="cursor-pointer py-2 px-3 text-sm border-sky-700 bg-sky-700 border-solid border rounded-sm text-white hover:bg-sky-600 disabled:bg-slate-200 disabled:cursor-default disabled:text-slate-700 disabled:border-slate-400"
            type="button"
            label="Сохранить"
            v-if="start && end && timezone"
            :disabled="validationError"
            @click="updateNotices(currentNoticeId)"
          >
            Сохранить
          </button>
        </div>
      </Dialog>
    </div>
  </AdminLayout>
</template>
