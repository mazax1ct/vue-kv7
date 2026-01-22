import { ref } from 'vue'

export function useHoursPeriodsValidation(errorsArray) {
  const errors = ref([])

  return { errors }
}
