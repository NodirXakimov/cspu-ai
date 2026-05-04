<script setup lang="ts">
import type { Chat } from '@/types/chat'
import { Button } from '@/components/ui/button'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { PlusIcon, Trash2Icon } from 'lucide-vue-next'
import { ScrollArea } from '@/components/ui/scroll-area'

defineProps<{
  chats: Chat[]
  activeChatId: string | null
}>()

const emit = defineEmits<{
  (e: 'newChat'): void
  (e: 'selectChat', id: string): void
  (e: 'deleteChat', id: string): void
}>()

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Bugun'
  if (diffDays === 1) return 'Kecha'
  if (diffDays < 7) return `${diffDays} kun oldin`
  return date.toLocaleDateString('uz-UZ')
}
</script>

<template>
  <div class="flex h-full flex-col bg-sidebar text-sidebar-foreground">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-sidebar-border px-4 py-3">
      <div class="flex items-center gap-2">
        <img src="/cspu-logo.png" alt="CSPU" class="h-8 w-auto" />
        <span class="text-lg font-semibold">AI</span>
      </div>
      <Button variant="ghost" size="icon" @click="emit('newChat')" title="Yangi suhbat">
        <PlusIcon class="size-5" />
      </Button>
    </div>

    <!-- Chat list -->
    <div class="flex-1 overflow-hidden">
      <ScrollArea class="h-full">
        <div class="p-2">
          <p class="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Suhbatlar tarixi
          </p>

          <div v-if="chats.length === 0" class="px-2 py-8 text-center text-sm text-muted-foreground">
            Hozircha suhbatlar yo'q
          </div>

          <button
            v-for="chat in chats"
            :key="chat.id"
            class="group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-sidebar-accent"
            :class="chat.id === activeChatId ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''"
            @click="emit('selectChat', chat.id)"
          >
            <div class="flex-1 min-w-0">
              <p class="truncate font-medium">{{ chat.title }}</p>
              <p class="truncate text-xs text-muted-foreground">
                {{ formatDate(chat.updatedAt) }}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              class="size-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              @click.stop="emit('deleteChat', chat.id)"
              title="O'chirish"
            >
              <Trash2Icon class="size-4 text-destructive" />
            </Button>
          </button>
        </div>
      </ScrollArea>
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-between border-t border-sidebar-border px-4 py-3">
      <span class="text-xs text-muted-foreground">CHDPU</span>
      <ThemeToggle />
    </div>
  </div>
</template>
