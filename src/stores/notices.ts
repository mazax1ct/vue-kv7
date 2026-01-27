import { ref } from 'vue'
import axios from 'axios'
import { API_BASE_URL } from '@/constants'
import { defineStore } from 'pinia'
import type { Notice } from '@/types/types'

export const useNoticesStore = defineStore('notices', () => {
  const notices = ref<Notice[]>([])
  const isLoading = ref<boolean>(false)
  const error = ref<Error | undefined>()

  async function fetchNotices() {
    isLoading.value = true

    try {
      const { data } = await axios.get(`${API_BASE_URL}/notices`)

      notices.value = data

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

  function getNotice(id: string) {
    return notices.value.find((noticeItem: Notice) => Number(noticeItem.id) === Number(id))
  }

  async function updateNotice(noticeObj: Notice) {
    isLoading.value = true

    try {
      await axios.patch(`${API_BASE_URL}/notices/${noticeObj.id}`, noticeObj)

      fetchNotices()

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

  async function createNotice(noticeObj: Notice) {
    isLoading.value = true

    /*TODO: УБРАТЬ ФОРМИРОВАНИЕ ID, ПЕРЕНЕСТИ НА BACK*/
    let newNoticeId: string = ''

    if (notices.value.length > 0) {
      const ids = notices.value.map(item => Number(item.id))
      const maxId = Math.max(...ids)
      newNoticeId = String(Number(maxId) + 1)
    } else {
      newNoticeId = '1'
    }

    noticeObj.id = newNoticeId
    /*TODO: УБРАТЬ ФОРМИРОВАНИЕ ID, ПЕРЕНЕСТИ НА BACK*/

    try {
      await axios.post(`${API_BASE_URL}/notices`, noticeObj)

      fetchNotices()

      console.log('запись в сторе создана')
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

  async function deleteNotice(id: string) {
    isLoading.value = true

    try {
      await axios.delete(`${API_BASE_URL}/notices/${id}`)

      fetchNotices()

      console.log('запись в сторе удалена')
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
    notices,
    isLoading,
    error,
    fetchNotices,
    getNotice,
    updateNotice,
    createNotice,
    deleteNotice,
  }
})
