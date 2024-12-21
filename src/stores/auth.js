import { defineStore } from 'pinia'
import { firebaseAuth } from 'boot/firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    currentUser: (state) => state.user
  },

  actions: {
    async register(email, password, name) {
      try {
        this.loading = true
        this.error = null
        const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password)
        const user = userCredential.user
        // 更新用戶資料以包含名稱
        await updateProfile(user, {
          displayName: name
        })
        this.user = user
        return user
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async login(email, password, rememberMe = false) {
      try {
        this.loading = true
        this.error = null
        
        // 設置持久化類型
        const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence
        await setPersistence(firebaseAuth, persistenceType)
        
        const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password)
        this.user = userCredential.user
        return userCredential.user
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async logout() {
      try {
        await signOut(firebaseAuth)
        this.user = null
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async init() {
      // 監聽認證狀態變化
      onAuthStateChanged(firebaseAuth, (user) => {
        this.user = user
        this.loading = false
      })
    }
  }
})
