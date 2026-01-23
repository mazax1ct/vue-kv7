import { ref } from 'vue'
import axios from 'axios'
import { API_BASE_URL } from '@/constants'
import { defineStore } from 'pinia'

export const useNoticesStore = defineStore('notices', () => {
  const notices = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  async function fetchNotices() {
    isLoading.value = true
    error.value = null

    try {
      const { data } = await axios.get(`${API_BASE_URL}/notices`)

      notices.value = data

      console.log('данные в сторе получены')
    } catch (err) {
      error.value = err
      console.error('Failed to fetch data:', err)
    } finally {
      isLoading.value = false
    }
  }

  function getNotice(id) {
    return notices.value.find((noticeItem) => Number(noticeItem.id) === Number(id))
  }

  async function updateNotice(noticeObj) {
    isLoading.value = true
    error.value = null

    try {
      await axios.patch(`${API_BASE_URL}/notices/${noticeObj.id}`, noticeObj)

      fetchNotices()

      console.log('запись в сторе обновлена')
    } catch (err) {
      error.value = err
      console.error('Failed to fetch data:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function createNotice(noticeObj) {
    isLoading.value = true
    error.value = null

    /*TODO: УБРАТЬ ФОРМИРОВАНИЕ ID, ПЕРЕНЕСТИ НА BACK*/
    let newNoticeId = 0

    if (notices.value.length > 0) {
      const ids = notices.value.map(item => item.id)
      const maxId = Math.max(...ids);
      newNoticeId = Number(maxId) + 1
    } else {
      newNoticeId = 1
    }

    noticeObj.id = Number(newNoticeId)
    /*TODO: УБРАТЬ ФОРМИРОВАНИЕ ID, ПЕРЕНЕСТИ НА BACK*/

    try {
      await axios.post(`${API_BASE_URL}/notices`, noticeObj)

      fetchNotices()

      console.log('запись в сторе создана')
    } catch (err) {
      error.value = err
      console.error('Failed to fetch data:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function deleteNotice(id) {
    isLoading.value = true
    error.value = null

    try {
      await axios.delete(`${API_BASE_URL}/notices/${id}`)

      fetchNotices()

      console.log('запись в сторе удалена')
    } catch (err) {
      error.value = err
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
