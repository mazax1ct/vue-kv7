<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Select from 'primevue/select'
import { HOURS } from '@/constants'

//принимаемые извне параметры
const props = defineProps<{
  id?: string
  day_num?: string
  start?: string
  end?: string
  start_title: string
  end_title: string
  error_text: string
}>()

//выбрасываемое событие
const emit = defineEmits(['sendHoursRange', 'sendHoursRangeError'])

const id = ref<string>(props.id || '')

const start = ref<string>(props.start || '')

const end = ref<string>(props.end || '')

const isError = ref<boolean>()

const startEndValidation = (start: string, end: string) => {
  if (start !== undefined && end !== undefined) {
    if (HOURS.indexOf(start) >= HOURS.indexOf(end)) {
      isError.value = true
    } else {
      isError.value = false
    }
  }
}

const sendHoursRange = () => {
  const range = {
    start: start.value,
    end: end.value,
  }

  emit('sendHoursRange', range, props.day_num)
}

const sendHoursRangeError = (id: string, del: boolean = false) => {
  const error = {
    id: id,
    state: isError.value,
  }

  emit('sendHoursRangeError', error, del)
}

onMounted(() => {
  startEndValidation(start.value, end.value)
  sendHoursRange()
  sendHoursRangeError('hoursRange_' + id.value)
})

onUnmounted(() => {
  sendHoursRangeError('hoursRange_' + id.value, true)
})
</script>

<template>
  <div :id="'hoursRange_' + id" class="flex flex-wrap gap-4">
    <div style="width: calc(100% / 2 - var(--spacing) * 4 / 2)">
      <p class="mb-1">{{ start_title }}</p>

      <Select
        v-model="start"
        :options="HOURS"
        placeholder="Выберите время"
        class="w-full"
        size="small"
        :invalid="isError"
        @change="
          () => {
            startEndValidation(start, end)
            sendHoursRange()
            sendHoursRangeError('hoursRange_' + id)
          }
        "
      />
    </div>

    <div style="width: calc(100% / 2 - var(--spacing) * 4 / 2)">
      <p class="mb-1">{{ end_title }}</p>

      <Select
        v-model="end"
        :options="HOURS"
        placeholder="Выберите время"
        class="w-full"
        size="small"
        :invalid="isError"
        @change="
          () => {
            startEndValidation(start, end)
            sendHoursRange()
            sendHoursRangeError('hoursRange_' + id)
          }
        "
      />
    </div>
  </div>

  <div
    v-if="isError"
    class="p-2 mb-4 mt-2 border-solid border rounded-sm bg-red-100 border-red-800 text-red-800"
  >
    {{ error_text }}
  </div>
</template>
