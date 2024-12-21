import { defineStore } from 'pinia'
import { firebaseAuth } from 'boot/firebase'
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // 狀態
  const user = ref(null)
  const loading = ref(true)
  const error = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const userDisplayName = computed(() => user.value?.displayName || '')
  const userEmail = computed(() => user.value?.email || '')

  // Actions
  const handleAuthStateChange = () => {
    onAuthStateChanged(firebaseAuth, (userData) => {
      loading.value = false
      user.value = userData
      error.value = null
    })
  }

  const login = async (email, password) => {
    try {
      loading.value = true
      error.value = null
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password)
      user.value = userCredential.user
      return userCredential.user
    } catch (err) {
      error.value = translateFirebaseError(err)
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const register = async (email, password, name) => {
    try {
      loading.value = true
      error.value = null
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password)
      
      // 更新用戶資料
      await updateProfile(userCredential.user, {
        displayName: name
      })
      
      user.value = userCredential.user
      return userCredential.user
    } catch (err) {
      error.value = translateFirebaseError(err)
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      loading.value = true
      error.value = null
      await signOut(firebaseAuth)
      user.value = null
    } catch (err) {
      error.value = translateFirebaseError(err)
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // 輔助函數：翻譯 Firebase 錯誤訊息
  const translateFirebaseError = (error) => {
    const errorMessages = {
      'auth/user-not-found': '找不到此用戶',
      'auth/wrong-password': '密碼錯誤',
      'auth/invalid-email': '無效的電子郵件地址',
      'auth/user-disabled': '此帳號已被停用',
      'auth/email-already-in-use': '此電子郵件已被註冊',
      'auth/operation-not-allowed': '此註冊方式未啟用',
      'auth/weak-password': '密碼強度不足'
    }
    
    return {
      code: error.code,
      message: errorMessages[error.code] || '發生錯誤，請稍後再試'
    }
  }

  // 初始化監聽器
  handleAuthStateChange()

  return {
    // 狀態
    user,
    loading,
    error,
    
    // Getters
    isAuthenticated,
    userDisplayName,
    userEmail,
    
    // Actions
    login,
    register,
    logout
  }
})
