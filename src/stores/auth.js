import { defineStore } from 'pinia'
import {
  firebaseAuth,
  firebaseDb,
  realtimeDb
} from 'boot/firebase'
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
import {
  doc,
  getDoc,
  setDoc
} from 'firebase/firestore'
import {
  ref,
  set,
  get
} from 'firebase/database'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    userDetails: {},
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    currentUser: (state) => state.user,
    getUserDetails: (state) => state.userDetails
  },

  actions: {
    setUserDetails(details) {
      this.userDetails = details
    },

    async register(email, password, name) {
      try {
        if (!email || !password) {
          throw new Error('Email and password are required')
        }

        this.loading = true
        this.error = null
        const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password)
        const user = userCredential.user
        
        // Update user profile with name
        if (name) {
          await updateProfile(user, {
            displayName: name
          })
        }

        // 準備用戶資料
        const userData = {
          email: user.email,
          displayName: name || '',
          uid: user.uid,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        }

        // 同步到 Firestore
        const userDocRef = doc(firebaseDb, 'users', user.uid)
        await setDoc(userDocRef, userData)

        // 同步到 Realtime Database
        const userRef = ref(realtimeDb, `users/${user.uid}`)
        await set(userRef, userData)

        this.user = user
        this.userDetails = userData
        return user
      } catch (error) {
        this.error = error.message
        console.error('註冊失敗:', error.message)
        throw error
      } finally {
        this.loading = false
      }
    },

    async login(email, password, rememberMe = false) {
      try {
        if (!email || !password) {
          throw new Error('Email and password are required')
        }

        this.loading = true
        this.error = null
        
        // Set persistence type
        const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence
        await setPersistence(firebaseAuth, persistenceType)
        
        const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password)
        const user = userCredential.user

        // 更新最後登入時間
        const lastLoginData = {
          lastLoginAt: new Date().toISOString()
        }

        // 更新 Realtime Database 的最後登入時間
        const userRef = ref(realtimeDb, `users/${user.uid}`)
        await set(userRef, lastLoginData, { merge: true })

        this.user = user
        return user
      } catch (error) {
        this.error = error.message
        console.error('登入失敗:', error.message)
        throw error
      } finally {
        this.loading = false
      }
    },

    async logout() {
      try {
        await signOut(firebaseAuth)
        this.user = null
        this.userDetails = {}
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async handleAuthStateChange() {
      onAuthStateChanged(firebaseAuth, async (user) => {
        this.loading = true
        try {
          if (user) {
            this.user = user
            
            // 從 Realtime Database 獲取用戶資料
            const userRef = ref(realtimeDb, `users/${user.uid}`)
            const snapshot = await get(userRef)
            
            if (snapshot.exists()) {
              const userData = snapshot.val()
              this.setUserDetails(userData)
            } else {
              // 如果 Realtime Database 沒有資料，嘗試從 Firestore 獲取
              const userDocRef = doc(firebaseDb, 'users', user.uid)
              const userDoc = await getDoc(userDocRef)
              
              if (userDoc.exists()) {
                const userData = userDoc.data()
                // 同步到 Realtime Database
                await set(userRef, userData)
                this.setUserDetails(userData)
              } else {
                console.log('未找到用戶資料')
                this.setUserDetails({})
              }
            }
          } else {
            this.user = null
            this.setUserDetails({})
          }
        } catch (error) {
          console.error('認證狀態變更錯誤:', error)
          this.error = error.message
        } finally {
          this.loading = false
        }
      })
    },

    async init() {
      await this.handleAuthStateChange()
    }
  }
})
