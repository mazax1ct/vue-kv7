import { ref, computed } from 'vue'
import axios from 'axios'
import moment from 'moment'
import { API_BASE_URL, DAYS } from '@/constants'
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

      console.log('данные в сторе загружены', marks.value)
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

  function prepareFilters(columnsArray) {
    if (isLoaded) {
      columnsArray.forEach((col) => {
        let uniqueValues = [...new Set(marks.value.map((obj) => obj[col.field]))] //собираем массив уникальных значений для фильтров

        //сортировка значений для фильтров
        if (col.field === 'day') {
          uniqueValues.sort((a, b) => {
            return DAYS.indexOf(a) - DAYS.indexOf(b)
          })
        } else {
          uniqueValues.sort()
        }

        col.options = uniqueValues //запись значений для фильтров
      })
    } else {
      columnsArray.forEach((col) => {
        col.options = []
      })
    }
  }

  return {
    marks,
    isLoading,
    isLoaded,
    error,
    fetchMarks,
    prepareFilters
  }
})
