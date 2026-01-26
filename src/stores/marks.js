import { ref, computed } from 'vue'
import axios from 'axios'
import moment from 'moment'
import { API_BASE_URL } from '@/constants'
import { defineStore } from 'pinia'

export const useMarksStore = defineStore('marks', () => {
  const marks = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  async function fetchMarks(startDate, endDate) {
    isLoading.value = true

    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/marks?date_gte=${moment(startDate, 'DD-MM-YYYY').unix()}&date_lte=${moment(endDate, 'DD-MM-YYYY').unix()}`,
      )

      marks.value = data

      console.log('данные в сторе загружены')
    } catch (err) {
      error.value = err
      console.error('Failed to fetch data:', err)
    } finally {
      isLoading.value = false
    }
  }

  const isLoaded = computed(() => {
    return marks.value.length > 0
  })

  return {
    marks,
    isLoading,
    isLoaded,
    error,
    fetchMarks
  }
})
