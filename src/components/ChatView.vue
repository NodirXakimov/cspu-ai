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
  PromptInputSubmit,
  PromptInputTextarea,
} from '@/components/ai-elements/prompt-input'
import { useAudioRecorder } from '@/composables/useAudioRecorder'
import { MicIcon, SendIcon, Trash2Icon, Loader2Icon } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import { computed } from 'vue'
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
  (e: 'sendVoice', blob: Blob, filename: string): void
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
const isSendingVoice = ref(false)
const conversationRef = ref<InstanceType<typeof Conversation> | null>(null)

const {
  isRecording,
  elapsedMs,
  audioLevel,
  error: recorderError,
  start: startRecording,
  stop: stopRecording,
  cancel: cancelRecording,
} = useAudioRecorder()

const formattedTime = computed(() => {
  const total = Math.floor(elapsedMs.value / 1000)
  const m = Math.floor(total / 60).toString().padStart(2, '0')
  const s = (total % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})

const waveformBars = computed(() => {
  const level = audioLevel.value
  return Array.from({ length: 20 }, (_, i) => {
    const phase = (i / 20 + Date.now() / 600) % 1
    const wobble = 0.5 + 0.5 * Math.sin(phase * Math.PI * 2)
    const h = 4 + level * 26 * wobble + (level > 0.05 ? 4 : 0)
    return Math.max(3, Math.min(30, h))
  })
})

async function handleStartRecording() {
  await startRecording()
}

async function handleSendRecording() {
  if (!isRecording.value || isSendingVoice.value) return
  isSendingVoice.value = true
  const result = await stopRecording()
  isSendingVoice.value = false
  if (result) {
    emit('sendVoice', result.blob, `recording.${result.extension}`)
    scrollToLatest()
  }
}

async function handleCancelRecording() {
  if (!isRecording.value) return
  await cancelRecording()
}

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
        <!-- Recording overlay replaces the input while a recording is active -->
        <div
          v-if="isRecording || isSendingVoice"
          class="flex w-full items-center gap-2 rounded-3xl border border-border bg-background px-3 py-2 shadow-sm"
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            class="text-destructive shrink-0"
            :disabled="isSendingVoice"
            title="Bekor qilish"
            @click="handleCancelRecording"
          >
            <Trash2Icon class="size-4" />
          </Button>

          <div class="flex flex-1 items-center justify-center gap-[3px] overflow-hidden">
            <span
              v-for="(h, i) in waveformBars"
              :key="i"
              class="w-[3px] rounded-full bg-primary/70 transition-[height] duration-75"
              :style="{ height: `${h}px` }"
            />
          </div>

          <div class="flex shrink-0 items-center gap-2 text-sm tabular-nums text-muted-foreground">
            <span
              :class="cn(
                'inline-block size-2 rounded-full bg-destructive',
                isRecording && !isSendingVoice && 'animate-pulse',
              )"
            />
            <span>{{ formattedTime }}</span>
          </div>

          <Button
            type="button"
            size="icon"
            class="shrink-0"
            :disabled="isSendingVoice || elapsedMs < 300"
            title="Yuborish"
            @click="handleSendRecording"
          >
            <Loader2Icon v-if="isSendingVoice" class="size-4 animate-spin" />
            <SendIcon v-else class="size-4" />
          </Button>
        </div>

        <PromptInputProvider
          v-else
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
                <Button
                  v-else
                  type="button"
                  variant="ghost"
                  size="icon"
                  :title="recorderError ?? 'Ovozli savol yozish'"
                  @click="handleStartRecording"
                >
                  <MicIcon class="size-4" />
                </Button>
              </InputGroupAddon>
            </PromptInput>
          </div>
        </PromptInputProvider>
      </div>
    </div>
  </div>
</template>
