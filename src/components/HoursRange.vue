<script setup>
import { ref, onMounted } from 'vue'
import Select from 'primevue/select'
import { HOURS } from '@/constants'

//принимаемые извне параметры
const props = defineProps({
  id: {
    type: String,
  },
  start: {
    type: String,
  },
  end: {
    type: String,
  },
  start_title: {
    type: String,
    required: true,
  },
  end_title: {
    type: String,
    required: true,
  },
  error_text: {
    type: String,
    required: true,
  },
})

//выбрасываемое событие
const emit = defineEmits(['sendHoursRange', 'sendHoursRangeError'])

const id = ref(props.id)

const start = ref(props.start)

const end = ref(props.end)

const isError = ref()

const startEndValidation = (start, end) => {
  if (HOURS.indexOf(start) >= HOURS.indexOf(end)) {
    isError.value = true
  } else {
    isError.value = false
  }
}


const sendHoursRange = () => {
  const range = {
    start: start.value,
    end: end.value,
  }

  emit('sendHoursRange', range)
}

const sendHoursRangeError = (id) => {
  const error = {
    id: id,
    state: isError.value,
  }

  emit('sendHoursRangeError', error)
}

onMounted(() => {
  startEndValidation(start.value, end.value)
  sendHoursRange()
  sendHoursRangeError('hoursRange_' + id.value)
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
            sendHoursRange(start, end)
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
            sendHoursRange(start, end)
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
