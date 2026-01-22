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
const emit = defineEmits(['sendHoursRange'])

const id = ref(props.id)

const start = ref(props.start)

const end = ref(props.end)

//валидация начала и конца
const errorOuter = ref({}) //выбрасываемая наружу ошибка

const errorInner = ref() //внутренняя ошибка

const startEndValidation = (id, start, end) => {
  if (HOURS.indexOf(start) >= HOURS.indexOf(end)) {
    errorInner.value = true
  } else {
    errorInner.value = false
  }

  errorOuter.value = {
    id: id,
    error: errorInner.value,
  }
}

//обновление значений переменных и отправка события с параметрами в родительский компонент
const sendHoursRange = () => {
  const range = {
    start: start.value,
    end: end.value,
  }

  const err = errorOuter.value

  emit('sendHoursRange', range, err)
}

onMounted(() => {
  startEndValidation('hoursPeriod_' + id.value, start.value, end.value)

  sendHoursRange()
})
</script>

<template>
  <div :id="'HoursPeriod_' + id" class="flex flex-wrap gap-4">
    <div style="width: calc(100% / 2 - var(--spacing) * 4 / 2)">
      <p class="mb-1">{{ start_title }}</p>

      <Select
        v-model="start"
        :options="HOURS"
        placeholder="Выберите время"
        class="w-full"
        size="small"
        :invalid="errorInner"
        @change="
          () => {
            startEndValidation('HoursPeriod_' + id, start, end)
            sendHoursRange()
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
        :invalid="errorInner"
        @change="
          () => {
            startEndValidation('HoursPeriod_' + id, start, end)
            sendHoursRange()
          }
        "
      />
    </div>
  </div>

  <div
    v-if="errorInner"
    class="p-2 mb-4 mt-2 border-solid border rounded-sm bg-red-100 border-red-800 text-red-800"
  >
    {{ error_text }}
  </div>
</template>
