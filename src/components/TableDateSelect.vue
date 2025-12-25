<script setup>
import { ref } from 'vue'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import { ru } from 'date-fns/locale'
import '@vuepic/vue-datepicker/dist/main.css'

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

const startDate = ref(props.start)
const endDate = ref(props.end)
</script>

<template>
  <form class="d-flex align-items-center gap-3 mb-3" id="mainform" method="POST">
    <div class="form-group d-flex align-items-center gap-2">
      <label for="dateStart" class="text-nowrap">Дата начала:</label>

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
        placeholder="дд.мм.гггг"
      />
    </div>

    <div class="form-group d-flex align-items-center gap-2">
      <label for="dateEnd" class="text-nowrap">Дата окончания:</label>

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
        placeholder="дд.мм.гггг"
      />
    </div>

    <button class="btn btn-primary" type="submit">Получить данные</button>
  </form>
</template>
