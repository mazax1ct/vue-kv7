import { ref, computed } from 'vue'
import axios from 'axios'
import { API_BASE_URL } from '@/constants.ts'
import { defineStore } from 'pinia'
import type {Report} from '@/types/types'

export const useReportsStore = defineStore('reports', () => {
  const reports = ref<Report[]>([])
  const isLoading = ref<boolean>(false)
  const error = ref<Error | null>(null)

  async function fetchReports(params: object) {
    isLoading.value = true
    error.value = null

    try {
      const { data } = await axios.get<Report[]>(
        `${API_BASE_URL}/reports`, {
          params
        }
      )

      reports.value = data

      console.log(reports.value)

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
    return reports.value.length > 0
  })

  return {
    reports,
    isLoading,
    isLoaded,
    error,
    fetchReports,
  }
})
