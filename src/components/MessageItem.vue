<script setup lang="ts">
import type { ChatMessage } from '@/types/chat'
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message'
import { CopyIcon, CheckIcon, FileIcon } from 'lucide-vue-next'
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

function isImage(mediaType: string): boolean {
  return mediaType.startsWith('image/')
}
</script>

<template>
  <Message :from="message.role">
    <MessageContent>
      <!-- Attachments -->
      <div v-if="message.attachments?.length" class="flex flex-wrap gap-2">
        <template v-for="att in message.attachments" :key="att.url">
          <img
            v-if="isImage(att.mediaType)"
            :src="att.url"
            :alt="att.filename"
            class="max-h-48 max-w-xs rounded-lg object-cover"
          />
          <div
            v-else
            class="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2"
          >
            <FileIcon class="size-4 text-muted-foreground" />
            <span class="text-xs truncate max-w-[160px]">{{ att.filename }}</span>
          </div>
        </template>
      </div>

      <!-- Text content -->
      <MessageResponse v-if="message.content" :content="message.content" />

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
