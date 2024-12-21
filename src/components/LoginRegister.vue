<template>
  <div class="q-pa-md">
    <q-form
      ref="formRef"
      @submit="onSubmit"
      class="q-gutter-md"
    >
      <!-- 註冊時才顯示的名稱欄位 -->
      <q-input
        v-if="tab === 'register'"
        v-model="formData.name"
        label="姓名"
        :rules="[rules.required]"
        outlined
        dense
        lazy-rules
      >
        <template v-slot:prepend>
          <q-icon name="person" />
        </template>
      </q-input>

      <!-- Email 輸入欄位 -->
      <q-input
        v-model="formData.email"
        label="電子郵件"
        type="email"
        :rules="[rules.required, rules.email]"
        outlined
        dense
        lazy-rules
      >
        <template v-slot:prepend>
          <q-icon name="email" />
        </template>
      </q-input>

      <!-- 密碼輸入欄位 -->
      <q-input
        v-model="formData.password"
        label="密碼"
        :type="isPwd ? 'password' : 'text'"
        :rules="[rules.required, rules.password]"
        outlined
        dense
        lazy-rules
      >
        <template v-slot:prepend>
          <q-icon name="lock" />
        </template>
        <template v-slot:append>
          <q-icon
            :name="isPwd ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="isPwd = !isPwd"
          />
        </template>
      </q-input>

      <!-- 註冊時才顯示的確認密碼欄位 -->
      <q-input
        v-if="tab === 'register'"
        v-model="formData.confirmPassword"
        label="確認密碼"
        :type="isPwd ? 'password' : 'text'"
        :rules="[rules.required, rules.confirmPassword]"
        outlined
        dense
        lazy-rules
      >
        <template v-slot:prepend>
          <q-icon name="lock" />
        </template>
        <template v-slot:append>
          <q-icon
            :name="isPwd ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="isPwd = !isPwd"
          />
        </template>
      </q-input>

      <!-- 提交按鈕 -->
      <div class="full-width q-pt-md">
        <q-btn
          :label="tab === 'login' ? '登入' : '註冊'"
          type="submit"
          color="primary"
          class="full-width"
          :loading="loading"
          :disable="!isFormValid"
        >
          <template v-slot:loading>
            <q-spinner-facebook />
          </template>
        </q-btn>
      </div>

      <!-- 錯誤訊息顯示 -->
      <div v-if="errorMessage" class="text-negative text-center q-mt-sm">
        {{ errorMessage }}
      </div>
    </q-form>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'stores/auth'

// Props 定義
const props = defineProps({
  tab: {
    type: String,
    required: true,
    validator: (value) => ['login', 'register'].includes(value)
  }
})

// Store 和其他實例
const authStore = useAuthStore()
const $q = useQuasar()
const router = useRouter()

// 顯示成功訊息
const showSuccess = (message) => {
  $q.notify({
    type: 'positive',
    message,
    position: 'top',
    timeout: 2500
  })
}

// 顯示錯誤訊息
const showError = (message) => {
  $q.notify({
    type: 'negative',
    message,
    position: 'top',
    timeout: 2500
  })
}

// 響應式狀態
const isPwd = ref(true)
const loading = ref(false)
const errorMessage = ref('')
const formRef = ref(null)

// 表單數據
const formData = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// 表單驗證規則
const rules = {
  required: val => !!val || '此欄位為必填',
  email: val => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailPattern.test(val) || '請輸入有效的電子郵件地址'
  },
  password: val => {
    if (!val) return '請輸入密碼'
    if (val.length < 6) return '密碼長度至少需要6個字符'
    if (!/\d/.test(val)) return '密碼必須包含至少一個數字'
    if (!/[a-zA-Z]/.test(val)) return '密碼必須包含至少一個字母'
    return true
  },
  confirmPassword: val => val === formData.password || '密碼不匹配'
}

// 計算屬性：表單是否有效
const isFormValid = computed(() => {
  if (!formData.email || !formData.password) return false
  if (props.tab === 'register' && (!formData.name || !formData.confirmPassword)) return false
  return true
})

// 重置表單
const resetForm = () => {
  formData.name = ''
  formData.email = ''
  formData.password = ''
  formData.confirmPassword = ''
  errorMessage.value = ''
  if (formRef.value) {
    formRef.value.resetValidation()
  }
}

// 處理登入
const handleLogin = async () => {
  try {
    await authStore.login(formData.email, formData.password)
    return true
  } catch (error) {
    throw new Error(error.message)
  }
}

// 處理註冊
const handleRegister = async () => {
  try {
    // 密碼確認檢查
    if (formData.password !== formData.confirmPassword) {
      throw new Error('密碼不匹配')
    }

    await authStore.register(formData.email, formData.password, formData.name)
    return true
  } catch (error) {
    throw new Error(error.message)
  }
}

// 表單提交處理
const onSubmit = async () => {
  try {
    // 表單驗證
    if (formRef.value) {
      const isValid = await formRef.value.validate()
      if (!isValid) return
    }

    loading.value = true
    errorMessage.value = ''

    // 這裡添加實際的登入/註冊邏輯
    if (props.tab === 'login') {
      await handleLogin()
      showSuccess('登入成功')
    } else {
      await handleRegister()
      showSuccess('註冊成功')
    }

    // 重置表單
    resetForm()
    
    // 登入成功後重定向到首頁
    router.push('/')
  } catch (error) {
    errorMessage.value = error.message || '發生錯誤'
    showError(errorMessage.value)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.q-form {
  max-width: 400px;
  margin: 0 auto;
}

.q-input {
  margin-bottom: 1rem;
}

/* 添加一些動畫效果 */
.q-btn {
  transition: all 0.3s ease;
}

.q-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}
</style>