<template>
  <q-page class="flex column">
    <q-banner inline-actions class="text-center bg-grey-4"> User is offline </q-banner>
    <div class="q-pa-md column col justify-end">
      <q-chat-message
        v-for="message in messages"
        :key="message.text"
        :name="message.from"
        :text="[message.text]"
        :sent="message.from === 'me' ? true : false"
      />
    </div>
    <q-footer elevated>
      <q-toolbar>
        <q-form @submit.prevent="sendMessage" class="full-width">
          <q-input 
            v-model.trim="newMessage" 
            bg-color="white" 
            outlined 
            rounded 
            label="Message" 
            dense
            :disable="sending"
            @keyup.enter="sendMessage"
          >
            <template v-slot:after>
              <q-btn 
                type="submit" 
                round 
                dense 
                flat 
                icon="send" 
                color="primary"
                :disable="!newMessage || sending"
              />
            </template>
          </q-input>
        </q-form>
      </q-toolbar>
    </q-footer>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

// 定義響應式的訊息變數
const newMessage = ref('')
const sending = ref(false)
const messages = ref([
  {
    text: 'hey, how are you?',
    from: 'me',
  },
  {
    text: 'doing fine, how r you?',
    from: 'then',
  },
  {
    text: 'I am fine, thank you!',
    from: 'me',
  },
])

// 發送訊息功能
const sendMessage = async () => {
  if (!newMessage.value || sending.value) return
  
  try {
    sending.value = true
    messages.value.push({
      text: newMessage.value,
      from: 'me',
    })
    newMessage.value = ''
  } catch (error) {
    console.error('Error sending message:', error)
  } finally {
    sending.value = false
  }
}
</script>

<style scoped>
.q-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding-bottom: 68px; /* 為底部工具列留出空間 */
}

.q-pa-md {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.q-footer {
  position: fixed;
  bottom: 0;
  width: 100%;
  background: white;
}

/* 確保訊息容器能夠滾動 */
.justify-end {
  min-height: min-content;
}
</style>
