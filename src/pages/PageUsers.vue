<template>
  <q-page class="flex">
    <q-list bordered class="full-width" separator>
      <!-- 線上聯絡人 -->
      <q-item v-for="user in users" :key="user.id" to="/chat" class="q-my-sm" clickable v-ripple>
        <q-item-section avatar>
          <q-avatar color="primary" text-color="white">
            {{ user.name.charAt(0) }}
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label>{{ user.name }}</q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-badge :color="user.online ? 'light-green-5' : 'grey-4'">
            {{ user.online ? 'online' : 'offline' }}
          </q-badge>
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

// 使用 ref 定義 users 資料
const users = ref([
  { id: 1, name: '吳小毛', online: true },
  { id: 2, name: '鄭小米', online: false },
  { id: 3, name: '武村', online: true },
])
</script>

<style scoped>
/* 保證 q-list 滿版 */
.q-page {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.q-list {
  flex: 1;
  max-height: 100%;
  overflow-y: auto;
}
</style>
