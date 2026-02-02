import { ref } from 'vue'
import axios from 'axios'
import { API_BASE_URL } from '@/constants'
import { defineStore } from 'pinia'
import type { Worktime } from '@/types/types'

export const useWorktimeStore = defineStore('worktime', () => {
  const worktime = ref<Worktime[]>([])
  const isLoading = ref<boolean>(false)
  const error = ref<Error | null>(null)

  async function fetchWorktime() {
    isLoading.value = true
    error.value = null

    try {
      const { data } = await axios.get(`${API_BASE_URL}/worktime`)

      worktime.value = data

      console.log('данные в сторе получены')
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

  return {
    worktime,
    isLoading,
    error,
    fetchWorktime
  }
})
