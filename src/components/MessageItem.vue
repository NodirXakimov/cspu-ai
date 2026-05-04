<script setup lang="ts">
import type { ChatMessage } from '@/types/chat'
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message'
import { CopyIcon, CheckIcon } from 'lucide-vue-next'
import { ref } from 'vue'

const props = defineProps<{
  message: ChatMessage
}>()

const copied = ref(false)

async function copyContent() {
  await navigator.clipboard.writeText(props.message.content)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}
</script>

<template>
  <Message :from="message.role">
    <MessageContent>
      <template v-if="message.type === 'text'">
        <MessageResponse :content="message.content" />
      </template>
      <template v-else-if="message.type === 'image'">
        <img
          v-if="message.metadata?.url"
          :src="String(message.metadata.url)"
          :alt="message.content"
          class="max-w-sm rounded-lg"
        />
        <span v-else class="text-muted-foreground text-sm">Rasm yuklanmoqda...</span>
      </template>
      <template v-else>
        <div class="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{{ message.content }}</span>
        </div>
      </template>

      <MessageActions v-if="message.role === 'assistant'">
        <MessageAction
          :tooltip="copied ? 'Nusxalandi!' : 'Nusxalash'"
          label="Nusxalash"
          @click="copyContent"
        >
          <CheckIcon v-if="copied" class="size-4" />
          <CopyIcon v-else class="size-4" />
        </MessageAction>
      </MessageActions>
    </MessageContent>
  </Message>
</template>
