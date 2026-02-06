<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Checkbox from 'primevue/checkbox'
import HoursRangePicker from '@/components/HoursRangePicker.vue'
import Button from 'primevue/button'
import { TIMEZONES, DAYS } from '@/constants'
import type { Worktime, HoursRange, HoursRangeError } from '@/types/types'

const props = defineProps<{
  worktimeItem: Worktime
}>()

const emit = defineEmits(['sendCloseDialog', 'sendUpdateWorktime'])

//локальная копия входящего объекта чтобы реактивно не менялась таблица
const localObject = ref<Worktime>({
  ...props.worktimeItem,
})

const errors = ref<HoursRangeError[]>([])

const isDisabled = computed(() => {
  return errors.value.some((item) => item.state === true)
})

const sendCloseDialog = () => {
  emit('sendCloseDialog')
}

const sendUpdateWorktime = () => {
  emit('sendUpdateWorktime', localObject.value)
}

const recieveHoursRange = (range: HoursRange, day_num: string) => {
  if (day_num) {
    const day = localObject.value.work_days.find(el => el.day_num === day_num)
    if (day) {
      day.work_start = range.start
      day.work_end = range.end
    }
  } else {
    localObject.value.all_week_start = range.start
    localObject.value.all_week_end = range.end
  }
}

const recieveHoursRangeError = (error: HoursRangeError, del: boolean) => {
  const err = errors.value.find((el) => el.id === error.id)

  if(!del) {
    if (!err) {
      errors.value.push(error)
    } else {
      err.state = error.state
    }
  } else {
    const index = errors.value.findIndex(el => el.id === error.id);
    if (index !== -1) {
      errors.value.splice(index, 1);
    }
  }
}

const loading = ref<boolean>(false)

watch(
  () => props.worktimeItem,
  (newObject: Worktime) => {
    localObject.value = { ...newObject }
  },
  //{ deep: true },
)
</script>

<template>
  <div v-if="localObject.type === 'worker'" class="mb-4">
    <div class="mb-4">
      <label class="block mb-1" for="worker_last_name">Фамилия сотрудника</label>

      <InputText
        id="worker_last_name"
        type="text"
        v-model="localObject.worker_last_name"
        size="small"
        fluid
      />
    </div>

    <div class="mb-4">
      <label class="block mb-1" for="worker_name">Имя сотрудника</label>

      <InputText
        id="worker_name"
        type="text"
        v-model="localObject.worker_name"
        size="small"
        fluid
      />
    </div>

    <div>
      <label class="block mb-1" for="worker_second_name">Отчество сотрудника</label>

      <InputText
        id="worker_second_name"
        type="text"
        v-model="localObject.worker_second_name"
        size="small"
        fluid
      />
    </div>
  </div>

  <div v-if="localObject.type === 'dept'" class="mb-4">
    <div class="mb-4">
      <label class="block mb-1" for="dept_device">Код подразделения</label>

      <InputText
        id="dept_device"
        type="text"
        v-model="localObject.dept_device"
        size="small"
        fluid
        disabled
      />
    </div>

    <div class="mb-4">
      <label class="block mb-1" for="dept_name">Подразделение</label>

      <InputText
        id="dept_name"
        type="text"
        v-model="localObject.dept_name"
        size="small"
        fluid
        placeholder="Укажите название подразделения"
      />
    </div>

    <div>
      <label class="block mb-1" for="timezone">Часовой пояс</label>

      <Select
        v-model="localObject.timezone"
        :options="TIMEZONES"
        optionLabel="value"
        optionValue="key"
        placeholder="Выберите часовой пояс"
        class="w-full"
        size="small"
        id="timezone"
        :invalid="!localObject.timezone"
      />
    </div>
  </div>

  <div class="mb-4">
    <label class="block mb-1" for="worktime">Режим работы</label>

    <InputText
      id="worktime"
      type="text"
      v-model="localObject.worktime"
      size="small"
      fluid
      placeholder="Укажите режим работы, если необходимо"
    />
  </div>

  <p class="mb-2 text-sm font-semibold">Время работы</p>

  <div v-if="localObject.type === 'worker'" class="flex items-center gap-2 mb-2">
    <Checkbox
      v-model="localObject.worker_worktime_like_unit"
      binary
      inputId="worker_worktime_like_unit"
      name="worker_worktime_like_unit"
    />
    <label for="worker_worktime_like_unit">Как в подразделении</label>
  </div>

  <div v-if="!localObject.worker_worktime_like_unit">

    <div class="flex items-center gap-2 mb-2">
      <Checkbox
        v-model="localObject.all_week"
        binary
        inputId="all_week"
        name="all_week"
      />
      <label for="all_week">Вся неделя</label>
    </div>

    <div v-if="localObject.all_week" class="mb-4">
      <HoursRangePicker
        @sendHoursRange="recieveHoursRange"
        @sendHoursRangeError="recieveHoursRangeError"
        :id="'all_week'"
        :start="localObject.all_week_start"
        :end="localObject.all_week_end"
        start_title="Начало рабочего дня"
        end_title="Конец рабочего дня"
        error_text="Ошибка! Время начала рабочего дня не может быть равно или больше времени конца рабочего дня!"
      />
    </div>

    <div v-else class="mb-4">
      <p class="mb-2 text-sm font-semibold">График по дням</p>

      <div v-for="day in localObject.work_days" :key="day.day_num" class="mb-2">
        <div class="flex gap-2">
          <p class="w-50 font-semibold">{{ DAYS[Number(day.day_num) - 1] }}</p>

          <div class="flex items-center gap-2">
            <Checkbox
              v-model="day.weekend"
              binary
              :inputId="'day_' + day.day_num"
              :name="'day_' + day.day_num"
            />
            <label :for="'day_' + day.day_num">Выходной</label>
          </div>
        </div>

        <div v-if="!day.weekend" class="mt-2">
          <HoursRangePicker
            @sendHoursRange="recieveHoursRange"
            @sendHoursRangeError="recieveHoursRangeError"
            :id="'day_' + day.day_num"
            :day_num="day.day_num"
            :start="day.work_start"
            :end="day.work_end"
            start_title="Начало рабочего дня"
            end_title="Конец рабочего дня"
            error_text="Ошибка! Время начала рабочего дня не может быть равно или больше времени конца рабочего дня!"
          />
        </div>
      </div>
    </div>

  </div>

  <div v-if="props.worktimeItem.type === 'dept'" class="flex items-center gap-2 mb-4">
    <Checkbox
      v-model="localObject.dept_set_to_all"
      binary
      inputId="dept_set_to_all"
      name="dept_set_to_all"
    />
    <label for="dept_set_to_all"
      >Установить такие же часы работы для ВСЕХ сотрудников подразделения</label
    >
  </div>

  <div class="flex flex-wrap gap-2">
    <Button
      class="ml-auto"
      type="button"
      severity="contrast"
      label="Закрыть"
      @click="sendCloseDialog()"
    />

    <Button
      type="button"
      severity="success"
      label="Сохранить"
      :disabled="isDisabled"
      :loading="loading"
      @click="sendUpdateWorktime()"
    />
  </div>
</template>
