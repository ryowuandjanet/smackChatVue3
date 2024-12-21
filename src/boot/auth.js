import { boot } from 'quasar/wrappers'
import { useAuthStore } from 'stores/auth'

export default boot(() => {
  const authStore = useAuthStore()
  
  // 初始化認證狀態監聽器
  authStore.init()
})
