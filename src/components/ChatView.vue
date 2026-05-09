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
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputProvider,
  PromptInputSpeechButton,
  PromptInputSubmit,
  PromptInputTextarea,
} from '@/components/ai-elements/prompt-input'
import { InputGroupAddon } from '@/components/ui/input-group'
import { Suggestion, Suggestions } from '@/components/ai-elements/suggestion'
import { Shimmer } from '@/components/ai-elements/shimmer'
import MessageItem from '@/components/MessageItem.vue'
import AttachmentPreviews from '@/components/AttachmentPreviews.vue'
import { BotIcon, MenuIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { nextTick, ref } from 'vue'

defineProps<{
  chat: Chat | null
  isLoading: boolean
}>()

const emit = defineEmits<{
  (e: 'send', content: string, files: PromptInputMessage['files']): void
  (e: 'toggleSidebar'): void
}>()

const suggestions = [
  "Sun'iy intellekt nima?",
  "Mashinali o'rganish haqida gapirib bering",
  "Python dasturlash tili",
  "Kiberxavfsizlik asoslari",
]

const isSubmitting = ref(false)
const hasText = ref(false)
const conversationRef = ref<InstanceType<typeof Conversation> | null>(null)

async function scrollToLatest() {
  await nextTick()
  conversationRef.value?.scrollToBottom()
}

function onInputEvent(e: Event) {
  const target = e.target as HTMLTextAreaElement
  if (target?.tagName === 'TEXTAREA') {
    hasText.value = target.value.trim().length > 0
  }
}

async function handleSubmit(payload: PromptInputMessage) {
  const text = payload.text.trim()
  const files = payload.files
  if (!text && files.length === 0) return
  if (isSubmitting.value) return
  isSubmitting.value = true
  hasText.value = false
  emit('send', text, files)
  scrollToLatest()
}

function handleSuggestionClick(suggestion: string) {
  emit('send', suggestion, [])
  scrollToLatest()
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
    <Conversation ref="conversationRef" class="flex-1" aria-label="Suhbat">
      <ConversationContent class="mx-auto w-full max-w-3xl">
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
      <div class="mx-auto max-w-3xl">
        <PromptInputProvider
          @submit="handleSubmit"
          accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.pptx,.zip"
          :max-files="10"
          :max-file-size="20 * 1024 * 1024"
        >
          <AttachmentPreviews class="mb-2" />
          <div class="**:data-[slot=input-group]:rounded-3xl **:data-[slot=input-group]:shadow-sm" @input.capture="onInputEvent">
            <PromptInput
              accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.pptx,.zip"
              :multiple="true"
            >
              <PromptInputTextarea placeholder="Xabar yozing..." class="px-4 pt-3" />
              <InputGroupAddon align="block-end" class="flex items-center justify-between">
                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger />
                  <PromptInputActionMenuContent>
                    <PromptInputActionAddAttachments label="Rasm yoki fayl qo'shish" />
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>
                <PromptInputSubmit v-if="hasText" :disabled="isSubmitting" />
                <PromptInputSpeechButton v-else />
              </InputGroupAddon>
            </PromptInput>
          </div>
        </PromptInputProvider>
      </div>
    </div>
  </div>
</template>
