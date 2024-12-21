<template>
  <q-page class="flex">
    <q-card class="full-width">
      <!-- Tabs 定義 -->
      <q-tabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="login" label="Login" />
        <q-tab name="register" label="Register" />
      </q-tabs>

      <!-- 分隔線 -->
      <q-separator />

      <!-- Tab Panels 定義 -->
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="login">
          <login-register :tab="tab" />
        </q-tab-panel>

        <q-tab-panel name="register">
          <login-register :tab="tab" />
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import LoginRegister from 'components/LoginRegister.vue'

// 定義響應式變數 tab
const tab = ref('login')
</script>
