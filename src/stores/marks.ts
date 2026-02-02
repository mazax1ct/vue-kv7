import { ref, computed } from 'vue'
import axios from 'axios'
import { API_BASE_URL } from '@/constants.ts'
import { defineStore } from 'pinia'
import type {Mark} from '@/types/types'

export const useMarksStore = defineStore('marks', () => {
  const marks = ref<Mark[]>([])
  const isLoading = ref<boolean>(false)
  const error = ref<Error | null>(null)

  async function fetchMarks(params: object) {
    isLoading.value = true
    error.value = null

    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/marks`, {
          params
        }
      )

      marks.value = data

      console.log('данные в сторе загружены')
    } catch (err) {
      if (err instanceof Error) {
        error.value = err
      } else {
        error.value = new Error('Unknown error')
      }
      console.error('Failed to fetch data:', err)
    } finally {
      isLoading.value = false
    }
  }

  const isLoaded = computed((): boolean => {
    return marks.value.length > 0
  })

  return {
    marks,
    isLoading,
    isLoaded,
    error,
    fetchMarks,
  }
})
