<script setup lang="ts">
import type { FileUIPart } from 'ai'
import ChatSidebar from '@/components/ChatSidebar.vue'
import ChatView from '@/components/ChatView.vue'
import Toaster from '@/components/Toaster.vue'
import { useChats } from '@/composables/useChats'
import { useToast } from '@/composables/useToast'
import { ref, watch } from 'vue'

const { success, error: toastError } = useToast()

const {
  chats,
  activeChat,
  activeChatId,
  isStreaming,
  createChat,
  deleteChat,
  setActiveChat,
  sendMessage,
  sendVoiceMessage,
} = useChats()

const sidebarOpen = ref(false)
const chatViewRef = ref<InstanceType<typeof ChatView> | null>(null)

async function handleSend(content: string, files: FileUIPart[] = []) {
  await sendMessage(content, files)
  chatViewRef.value?.onLoadingChange(false)
}

async function handleSendVoice(blob: Blob, filename: string) {
  await sendVoiceMessage(blob, filename)
}

function handleNewChat() {
  createChat()
  sidebarOpen.value = false
}

function handleSelectChat(id: string) {
  setActiveChat(id)
  sidebarOpen.value = false
}

async function handleDeleteChat(id: string) {
  const chat = chats.value.find(c => c.id === id)
  const title = chat?.title ?? 'Suhbat'
  const ok = await deleteChat(id)
  if (ok) {
    success(`"${title}" o'chirildi`)
  } else {
    toastError("Suhbatni o'chirib bo'lmadi. Qaytadan urinib ko'ring.")
  }
}

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') sidebarOpen.value = false
}

watch(sidebarOpen, (open) => {
  if (open) {
    document.addEventListener('keydown', handleKeydown)
  } else {
    document.removeEventListener('keydown', handleKeydown)
  }
})
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-background text-foreground">
    <!-- Mobile overlay -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-40 bg-black/50 md:hidden"
      @click="sidebarOpen = false"
    />

    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 z-50 w-72 shrink-0 transform border-r border-border transition-transform duration-200 md:relative md:translate-x-0"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <ChatSidebar
        :chats="chats"
        :active-chat-id="activeChatId"
        @new-chat="handleNewChat"
        @select-chat="handleSelectChat"
        @delete-chat="handleDeleteChat"
      />
    </aside>

    <Toaster />

    <!-- Main content -->
    <main class="flex-1 min-w-0">
      <ChatView
        ref="chatViewRef"
        :chat="activeChat"
        :is-loading="isStreaming"
        @send="handleSend"
        @send-voice="handleSendVoice"
        @toggle-sidebar="toggleSidebar"
      />
    </main>
  </div>
</template>
