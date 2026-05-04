<script setup lang="ts">
import type { Chat } from '@/types/chat'
import type { PromptInputMessage } from '@/components/ai-elements/prompt-input/types'
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation'
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from '@/components/ai-elements/prompt-input'
import { Suggestion, Suggestions } from '@/components/ai-elements/suggestion'
import { Shimmer } from '@/components/ai-elements/shimmer'
import MessageItem from '@/components/MessageItem.vue'
import { BotIcon, MenuIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { ref } from 'vue'

const props = defineProps<{
  chat: Chat | null
  isLoading: boolean
}>()

const emit = defineEmits<{
  (e: 'send', content: string): void
  (e: 'toggleSidebar'): void
}>()

const suggestions = [
  "Sun'iy intellekt nima?",
  "Mashinali o'rganish haqida gapirib bering",
  "Python dasturlash tili",
  "Kiberxavfsizlik asoslari",
]

const isSubmitting = ref(false)

async function handleSubmit(payload: PromptInputMessage) {
  const text = payload.text.trim()
  if (!text || isSubmitting.value) return
  isSubmitting.value = true
  emit('send', text)
}

function handleSuggestionClick(suggestion: string) {
  emit('send', suggestion)
}

function onLoadingChange(loading: boolean) {
  if (!loading) {
    isSubmitting.value = false
  }
}

defineExpose({ onLoadingChange })
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- Top bar with hamburger for mobile -->
    <div class="flex items-center gap-2 border-b border-border px-4 py-2 md:hidden">
      <Button variant="ghost" size="icon" @click="emit('toggleSidebar')">
        <MenuIcon class="size-5" />
      </Button>
      <span class="text-sm font-medium truncate">
        {{ chat?.title ?? 'CSPU AI' }}
      </span>
    </div>

    <!-- Conversation area -->
    <Conversation class="flex-1" aria-label="Suhbat">
      <ConversationContent>
        <template v-if="!chat || chat.messages.length === 0">
          <ConversationEmptyState
            title="CSPU AI ga xush kelibsiz!"
            description="Suhbatni boshlash uchun xabar yozing yoki quyidagi takliflardan birini tanlang"
          >
            <template #icon>
              <BotIcon class="size-10" />
            </template>
          </ConversationEmptyState>

          <div class="flex justify-center px-4 pb-4">
            <Suggestions>
              <Suggestion
                v-for="s in suggestions"
                :key="s"
                :suggestion="s"
                @click="handleSuggestionClick(s)"
              />
            </Suggestions>
          </div>
        </template>

        <template v-else>
          <MessageItem
            v-for="msg in chat.messages"
            :key="msg.id"
            :message="msg"
          />

          <div v-if="isLoading" class="flex w-full max-w-[80%] gap-2">
            <div class="flex w-fit flex-col gap-2 text-sm text-foreground">
              <Shimmer class="text-sm">O'ylayapman...</Shimmer>
            </div>
          </div>
        </template>
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>

    <!-- Input area -->
    <div class="border-t border-border p-4">
      <PromptInput @submit="handleSubmit" class="mx-auto max-w-3xl">
        <PromptInputBody>
          <PromptInputTextarea placeholder="Xabar yozing..." />
        </PromptInputBody>
        <PromptInputFooter>
          <div class="flex-1" />
          <PromptInputSubmit :disabled="isSubmitting" />
        </PromptInputFooter>
      </PromptInput>
    </div>
  </div>
</template>
