<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title class="absolute-center">
          {{ title }}
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

// 取得目前的路由
const route = useRoute()

// 使用 computed 計算屬性取得動態標題
const title = computed(() => {
  console.log('Current Route Object:', route)

  // 確保路由資訊已正確解析
  const currentRoute = route.path.split('/')[1]
  console.log('Current Route Path:', route.path)
  console.log('Current Route Segment:', currentRoute)

  if (currentRoute === '') return 'SmackChat'
  else if (currentRoute === 'chat') return 'Chat'
  else if (currentRoute === 'auth') return 'Auth'
  else return 'Unknown'
})
</script>
