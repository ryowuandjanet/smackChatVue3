<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          v-if="isChatPage"
          @click="goBack"
          flat
          dense
          icon="arrow_back"
          label="Back"
        />
        <q-toolbar-title class="absolute-center">
          {{ title }}
        </q-toolbar-title>
        <q-btn
          to="/auth"
          class="absolute-right q-pr-sm"
          icon="account_circle"
          flat
          dense
          no-caps
          label="Login"
        />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 計算屬性：動態標題
const title = computed(() => {
  const pathSegment = route.path.split('/')[1] || ''
  switch (pathSegment) {
    case '':
      return 'SmackChat'
    case 'chat':
      return 'Chat'
    case 'auth':
      return 'Auth'
    default:
      return 'Unknown'
  }
})

// 判斷是否為聊天頁面
const isChatPage = computed(() => route.path.startsWith('/chat'))

// 返回上一頁
const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/') // 如果沒有歷史，回到首頁
  }
}
</script>
