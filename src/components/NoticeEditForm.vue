<script setup>
import { ref } from 'vue'
import Select from 'primevue/select'
import HoursPeriod from '@/components/HoursPeriod.vue'
import Button from 'primevue/button'
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'
import { TIMEZONES } from '@/constants'

const props = defineProps({
  notice: {
    type: Object,
  },
})

const notice = ref(props.notice)

const loading = ref(false)

const emit = defineEmits(['sendCloseDialog', 'sendUpdateNotice', 'sendCreateNotice', 'sendDeleteNotice'])

//попап подтверждения удаления записи
const confirm = useConfirm()

const deleteConfirm = () => {
  confirm.require({
    group: 'headless',
    header: 'Подтверждение',
    message: 'Вы уверены, что хотите удалить запись?',
  })
}

const sendCloseDialog = () => {
  emit('sendCloseDialog')
}

const sendUpdateNotice = () => {
  emit('sendUpdateNotice', notice.value)
}

const sendCreateNotice = () => {
  emit('sendCreateNotice', notice.value)
}

const sendDeleteNotice = () => {
  emit('sendDeleteNotice', notice.id)
}

const recieveHoursRange = (range, err) => {
  notice.value.start = range.start
  notice.value.end = range.end

  //пишем/обновляем ошибку в массиве ошибок
  /*const error = errors.value.find((errEl) => errEl.id === err.id)

  if (!error) {
    errors.value.push(err)
  } else {
    error.error = err.error
  }*/
}
</script>

<template>
  <p class="mb-2 text-sm font-semibold">Часовой пояс</p>

  <Select
    v-model="notice.timezone"
    :options="TIMEZONES"
    optionLabel="value"
    optionValue="key"
    placeholder="Выберите часовой пояс"
    class="w-full mb-4"
    size="small"
    :invalid="!notice.timezone"
  />

  <p class="mb-2 text-sm font-semibold">Время работы</p>

  <div class="mb-4">
    <HoursPeriod
      @sendHoursRange="recieveHoursRange"
      :id="notice.id ? 'notice_' + Number(notice.id) : 'new_notice'"
      :start="notice.start"
      :end="notice.end"
      start_title="Начало проверки"
      end_title="Конец проверки"
      error_text="Ошибка! Время начала и конца проверки не может быть пустым, а так же время начала проверки не может быть равно или больше времени конца проверки!"
    />
  </div>

  <div class="flex flex-wrap gap-2">
    <ConfirmDialog group="headless">
      <template #container="{ message, acceptCallback, rejectCallback }">
        <div class="flex flex-col items-center p-8 bg-surface-0 dark:bg-surface-900 rounded">
          <h5 class="font-bold text-2xl block mb-2">{{ message.header }}</h5>

          <p class="mb-2">{{ message.message }}</p>

          <div class="flex items-center gap-2 mt-6">
            <Button
              type="button"
              severity="danger"
              label="Удалить"
              :loading="loading"
              @click="sendDeleteNotice(notice.id)"
            />

            <Button type="button" severity="contrast" label="Отмена" @click="rejectCallback" />
          </div>
        </div>
      </template>
    </ConfirmDialog>

    <Button
      v-if="notice.id"
      type="button"
      severity="danger"
      label="Удалить"
      @click="deleteConfirm()"
    />

    <Button
      class="ml-auto"
      type="button"
      severity="contrast"
      label="Закрыть"
      @click="sendCloseDialog()"
    />

    <Button
      v-if="notice.start && notice.end && notice.timezone"
      type="button"
      severity="success"
      label="Сохранить"
      :loading="loading"
      @click="notice.id ? sendUpdateNotice() : sendCreateNotice()"
    />
  </div>
</template>
