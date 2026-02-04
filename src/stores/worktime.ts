import { ref } from 'vue'
import axios from 'axios'
import { API_BASE_URL } from '@/constants'
import { defineStore } from 'pinia'
import type { PeriodDay, Worktime } from '@/types/types'

export const useWorktimeStore = defineStore('worktime', () => {
  const worktime = ref<Worktime[]>([])
  const isLoading = ref<boolean>(false)
  const error = ref<Error | null>(null)

  async function fetchWorktime() {
    isLoading.value = true
    error.value = null

    try {
      const { data } = await axios.get<Worktime[]>(`${API_BASE_URL}/worktime`)

      //TODO: перенести на back
      const transData = data.map((item: Worktime) => {
        const activeDays = item.work_intervals_full.filter((d) => d.weekend === false)
      
        const shortIntervals: PeriodDay[] = []
      
        if (activeDays.length > 0) {
          let current: PeriodDay | null = null
      
          activeDays.forEach((day) => {
            if (!current) {
              // старт нового интервала
              current = {
                day_start: day.day_num,
                day_end: day.day_num,
                work_start: day.work_start,
                work_end: day.work_end,
              }
              return
            }
      
            const sameTime = day.work_start === current.work_start && day.work_end === current.work_end
            const consecutive = Number(day.day_num) === Number(current.day_end) + 1
      
            if (sameTime && consecutive) {
              // продолжаем интервал
              current.day_end = day.day_num
            } else {
              // закрываем старый и начинаем новый
              shortIntervals.push({ ...current })
              current = {
                day_start: day.day_num,
                day_end: day.day_num,
                work_start: day.work_start,
                work_end: day.work_end,
              }
            }
          })
      
          if (current) {
            shortIntervals.push(current)
          }
        }
      
        return {
          ...item,
          work_intervals_short: shortIntervals,
        }
      })

      worktime.value = transData

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

  async function updateWortime(worktimeObj: Worktime) {
    isLoading.value = true
    error.value = null

    try {
      await axios.patch(`${API_BASE_URL}/worktime/${worktimeObj.id}`, worktimeObj)

      fetchWorktime()

      console.log('запись в сторе обновлена')
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
    fetchWorktime,
    updateWortime
  }
})
