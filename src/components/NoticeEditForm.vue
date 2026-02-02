<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Select from 'primevue/select'
import HoursRangePicker from '@/components/HoursRangePicker.vue'
import Button from 'primevue/button'
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'
import { TIMEZONES } from '@/constants'
import type { Notice, HoursRange, HoursRangeError } from '@/types/types'

const props = defineProps<{
  noticeItem: Notice
}>()

//локальная копия входящего объекта чтобы реактивно не менялась таблица
const localObject = ref<Notice>({
  ...props.noticeItem,
})

const loading = ref<boolean>(false)

const emit = defineEmits([
  'sendCloseDialog',
  'sendUpdateNotice',
  'sendCreateNotice',
  'sendDeleteNotice',
])

//попап подтверждения удаления записи
const confirm = useConfirm()

const deleteConfirm = () => {
  confirm.require({
    group: 'headless',
    header: 'Подтверждение',
    message: 'Вы уверены, что хотите удалить запись?',
  })
}

const errors = ref<HoursRangeError[]>([])

const isDisabled = computed(() => {
  return errors.value.some((item) => item.state === true)
})

const sendCloseDialog = () => {
  emit('sendCloseDialog')
}

const sendUpdateNotice = () => {
  emit('sendUpdateNotice', localObject.value)
}

const sendCreateNotice = () => {
  emit('sendCreateNotice', localObject.value)
}

const sendDeleteNotice = () => {
  emit('sendDeleteNotice', localObject.value)
}

const recieveHoursRange = (range: HoursRange) => {
  localObject.value.start = range.start
  localObject.value.end = range.end
}

const recieveHoursRangeError = (error: HoursRangeError) => {
  const err = errors.value.find((el) => el.id === error.id)

  if (!err) {
    errors.value.push(error)
  } else {
    err.state = error.state
  }
}

//вотчер за изменением пропсов из изменение локальной копии объекта
watch(
  () => props.noticeItem,
  (newObject: Notice) => {
    localObject.value = { ...newObject }
  },
  { deep: true },
)
</script>

<template>
  <p class="mb-2 text-sm font-semibold">Часовой пояс</p>

  <Select
    v-model="localObject.timezone"
    :options="TIMEZONES"
    optionLabel="value"
    optionValue="key"
    placeholder="Выберите часовой пояс"
    class="w-full mb-4"
    size="small"
    :invalid="!localObject.timezone"
  />

  <p class="mb-2 text-sm font-semibold">Время работы</p>

  <div class="mb-4">
    <HoursRangePicker
      @sendHoursRange="recieveHoursRange"
      @sendHoursRangeError="recieveHoursRangeError"
      :id="localObject.id ? 'notice_' + localObject.id : 'new_notice'"
      :start="localObject.start"
      :end="localObject.end"
      start_title="Начало проверки"
      end_title="Конец проверки"
      error_text="Ошибка! Время начала и конца проверки не может быть пустым, а так же время начала проверки не может быть равно или больше времени конца проверки!"
    />
  </div>

  <div class="flex flex-wrap gap-2">
    <ConfirmDialog group="headless">
      <template #container="{ message, rejectCallback }">
        <div class="flex flex-col items-center p-8 bg-surface-0 dark:bg-surface-900 rounded">
          <h5 class="font-bold text-2xl block mb-2">{{ message.header }}</h5>

          <p class="mb-2">{{ message.message }}</p>

          <div class="flex items-center gap-2 mt-6">
            <Button
              v-if="noticeItem.id"
              type="button"
              severity="danger"
              label="Удалить"
              :loading="loading"
              @click="sendDeleteNotice()"
            />

            <Button type="button" severity="contrast" label="Отмена" @click="rejectCallback" />
          </div>
        </div>
      </template>
    </ConfirmDialog>

    <Button
      v-if="localObject.id"
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
      v-if="localObject.start && localObject.end && localObject.timezone"
      type="button"
      severity="success"
      label="Сохранить"
      :loading="loading"
      :disabled="isDisabled"
      @click="localObject.id ? sendUpdateNotice() : sendCreateNotice()"
    />
  </div>
</template>
