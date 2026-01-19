<script setup>
import { ref } from 'vue'
import Select from 'primevue/select'
import { HOURS } from '@/constants'

const props = defineProps({
  start: {
    type: String,
    required: true,
  },

  end: {
    type: String,
    required: true,
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
    required: true
  }
})

const validationError = ref(false)

const startEndValidation = (start, end) => {
  if (HOURS.indexOf(start) >= HOURS.indexOf(end)) {
    validationError.value = true
  } else {
    validationError.value = false
  }
}

const emit = defineEmits(['sendHoursRange'])

const startDate = ref(props.start)

const endDate = ref(props.end)

function sendHoursRange() {
  const range = {
    start: startDate.value,
    end: endDate.value,
  }

  emit('sendHoursRange', range)
}
</script>

<template>
  <div class="flex flex-wrap gap-4">
    <div style="width: calc(100% / 2 - var(--spacing) * 4 / 2)">
      <p class="mb-1">{{ start_title }}</p>

      <Select
        v-model="startDate"
        :options="HOURS"
        placeholder="Выберите время"
        class="w-full"
        size="small"
        :invalid="validationError"
        @change="startEndValidation(startDate, endDate)"
        @update:modelValue="sendHoursRange"
      />
    </div>

    <div style="width: calc(100% / 2 - var(--spacing) * 4 / 2)">
      <p class="mb-1">{{ start_title }}</p>

      <Select
        v-model="endDate"
        :options="HOURS"
        placeholder="Выберите время"
        class="w-full"
        size="small"
        :invalid="validationError"
        @change="startEndValidation(startDate, endDate)"
        @update:modelValue="sendHoursRange"
      />
    </div>
  </div>

  <div
    v-if="validationError"
    class="p-2 mb-4 mt-2 border-solid border rounded-sm bg-red-100 border-red-800 text-red-800"
  >
    {{error_text}}
  </div>
</template>
