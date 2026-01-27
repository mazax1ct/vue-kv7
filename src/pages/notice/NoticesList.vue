<script setup lang="ts">
import { onMounted, ref } from 'vue'

import AdminLayout from '@/layouts/AdminLayout.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import NoticeEditForm from '@/components/NoticeEditForm.vue'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'

import { TIMEZONES } from '@/constants'

import type { Notice } from '@/types/types'

import { useNoticesStore } from '@/stores/notices'
import { storeToRefs } from 'pinia'

const noticesStore = useNoticesStore() //получаем доступ к стору

const { isLoading, notices, error } = storeToRefs(noticesStore) //деструктуризация данных из стора

const { fetchNotices, getNotice, updateNotice, createNotice, deleteNotice } = noticesStore

//уведомление об обновлении данных
const toast = useToast()

const notification = (severity: string, summary: string, detail: string) => {
  toast.add({ severity: severity, summary: summary, detail: detail, life: 3000 })
}

const noticeDefault = ref<Notice>({
  id: '',
  timezone: '',
  start: '',
  end: '',
})

const isProcess = ref<boolean>(false) //отметка о действии по кнопке

const visible = ref<boolean>(false) //отметка о видимости диалога

const currentNoticeId = ref<string>('') //id уведомления

const dialogHeader = ref<string>('') //заголовок диалога

//функция обновления данных в попапе
const updateNoticeDialogOnOpen = (id?: string) => {
  if (id) {
    dialogHeader.value = 'Редактирование'

    currentNoticeId.value = id
  } else {
    dialogHeader.value = 'Создание записи'
    currentNoticeId.value = ''
    noticeDefault.value = {
      id: '',
      timezone: '',
      start: '',
      end: '',
    }
  }

  visible.value = true
}

const recieveCloseDialog = () => {
  visible.value = !visible.value
}

const recieveUpdateNotice = async(notice: Notice) => {
  await updateNotice(notice)

  notification('info', 'Информация', 'Запись обновлена')

  visible.value = false
}

const recieveCreateNotice = async(notice: Notice) => {
  await createNotice(notice)

  notification('success', 'Информация', 'Запись добавлена')

  visible.value = false
}

const recieveDeleteNotice = async() => {
  await deleteNotice(currentNoticeId.value)

  notification('error', 'Информация', 'Запись удалена')

  visible.value = false
}

//получаем данные на маунт приложения
onMounted(async () => {
  fetchNotices()
})
</script>

<template>
  <AdminLayout>
    <div class="mx-auto max-w-5xl pt-4">
      <div class="text-right mb-4">
        <Button
          type="button"
          severity="info"
          label="Добавить уведомление"
          :loading="isProcess"
          @click="updateNoticeDialogOnOpen()"
        />
      </div>

      <DataTable
        ref="dt"
        responsiveLayout="scroll"
        dataKey="id"
        :value="notices"
        showGridlines
        :loading="isLoading"
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
          <template #body="slotProps">
            {{ TIMEZONES.find((timezone) => timezone.key === slotProps.data.timezone)?.value }}
          </template>
        </Column>

        <Column field="start" header="Начало"></Column>

        <Column field="end" header="Окончание"></Column>

        <Column field="id" style="width: 155px">
          <template #body="slotProps">
            <Button
              type="button"
              severity="info"
              variant="outlined"
              label="Редактировать"
              :loading="isProcess"
              @click="updateNoticeDialogOnOpen(slotProps.data.id)"
            />
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
        <NoticeEditForm
          @sendCloseDialog="recieveCloseDialog"
          @sendUpdateNotice="recieveUpdateNotice"
          @sendCreateNotice="recieveCreateNotice"
          @sendDeleteNotice="recieveDeleteNotice"
          :notice="currentNoticeId ? getNotice(currentNoticeId) : noticeDefault"
        />
      </Dialog>
    </div>
  </AdminLayout>
</template>
