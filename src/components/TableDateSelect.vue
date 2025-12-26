<script setup>
import { ref } from 'vue'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import { ru } from 'date-fns/locale'

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
  <div class="d-flex align-items-center gap-3 mb-3">
    <div class="form-group d-flex align-items-center gap-2">
      <label for="startDate" class="text-nowrap">Дата начала:</label>

      <VueDatePicker
        v-model="startDate"
        :starting-view-date="props.start"
        :time-config="{ enableTimePicker: false }"
        :formats="{ preview: 'dd.MM.yyyy', input: 'dd.MM.yyyy' }"
        :locale="ru"
        :action-row="{
          selectBtnLabel: 'Выбрать',
          cancelBtnLabel: 'Закрыть',
        }"
        :auto-apply="true"
        :max-date="endDate"
        @update:model-value="sendDatesRange"
        id="startDate"
        placeholder="дд.мм.гггг"
      />
    </div>

    <div class="form-group d-flex align-items-center gap-2">
      <label for="endDate" class="text-nowrap">Дата окончания:</label>

      <VueDatePicker
        v-model="endDate"
        :starting-view-date="props.end"
        :time-config="{ enableTimePicker: false }"
        :formats="{ preview: 'dd.MM.yyyy', input: 'dd.MM.yyyy' }"
        :locale="ru"
        :action-row="{
          selectBtnLabel: 'Выбрать',
          cancelBtnLabel: 'Закрыть',
        }"
        :auto-apply="true"
        :min-date="startDate"
        @update:model-value="sendDatesRange"
        id="endDate"
        placeholder="дд.мм.гггг"
      />
    </div>

    <!--<button @click="sendDatesRange" class="btn btn-primary" type="button">Получить данные</button>-->
  </div>
</template>

<style>
@import '@vuepic/vue-datepicker/dist/main.css';
.dp--clear-btn {
  display: none;
}
</style>
