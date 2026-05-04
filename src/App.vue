<script setup lang="ts">
import type { FileUIPart } from 'ai'
import ChatSidebar from '@/components/ChatSidebar.vue'
import ChatView from '@/components/ChatView.vue'
import { useChats } from '@/composables/useChats'
import { ref, watch } from 'vue'

const {
  chats,
  activeChat,
  activeChatId,
  createChat,
  deleteChat,
  setActiveChat,
  sendMessage,
} = useChats()

const isLoading = ref(false)
const sidebarOpen = ref(false)
const chatViewRef = ref<InstanceType<typeof ChatView> | null>(null)

async function handleSend(content: string, files: FileUIPart[] = []) {
  isLoading.value = true
  await sendMessage(content, files)
  isLoading.value = false
  chatViewRef.value?.onLoadingChange(false)
}

function handleNewChat() {
  createChat()
  sidebarOpen.value = false
}

function handleSelectChat(id: string) {
  setActiveChat(id)
  sidebarOpen.value = false
}

function handleDeleteChat(id: string) {
  deleteChat(id)
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

    <!-- Main content -->
    <main class="flex-1 min-w-0">
      <ChatView
        ref="chatViewRef"
        :chat="activeChat"
        :is-loading="isLoading"
        @send="handleSend"
        @toggle-sidebar="toggleSidebar"
      />
    </main>
  </div>
</template>
