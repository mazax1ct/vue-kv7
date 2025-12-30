<script setup>
import { ref } from 'vue'
import DatePicker from 'primevue/datepicker';

const props = defineProps({
  start: {
    type: Date,
    required: true,
  },

  end: {
    type: Date,
    required: true,
  },
})

const emit = defineEmits(['sendDatesRange'])

const startDate = ref(props.start)

const endDate = ref(props.end)

function sendDatesRange() {
  const range = {
    start: startDate.value,
    end: endDate.value,
  }

  emit('sendDatesRange', range)
}
</script>

<template>
  <div class="d-flex flex-wrap align-items-center gap-3">
    <div class="form-group d-flex align-items-center gap-2">
      <label for="startDate" class="text-nowrap" style="min-width: 95px">Дата начала:</label>

      <DatePicker v-model="startDate" showIcon iconDisplay="input" :maxDate="endDate" :manualInput="false" @update:modelValue="sendDatesRange"/>
    </div>

    <div class="form-group d-flex align-items-center gap-2">
      <label for="endDate" class="text-nowrap" style="min-width: 95px">Дата окончания:</label>

      <DatePicker v-model="endDate" showIcon iconDisplay="input" :minDate="startDate" :manualInput="false" @update:modelValue="sendDatesRange" />
    </div>
  </div>
</template>
