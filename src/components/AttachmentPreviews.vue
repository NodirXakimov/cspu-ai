<script setup lang="ts">
import { usePromptInput } from '@/components/ai-elements/prompt-input/context'
import { Button } from '@/components/ui/button'
import { XIcon, FileIcon } from 'lucide-vue-next'

const { files, removeFile } = usePromptInput()

function isImage(mediaType: string | undefined): boolean {
  return !!mediaType?.startsWith('image/')
}
</script>

<template>
  <div v-if="files.length > 0" class="flex flex-wrap gap-2">
    <div
      v-for="file in files"
      :key="file.id"
      class="group relative"
    >
      <!-- Image preview -->
      <div
        v-if="isImage(file.mediaType)"
        class="relative size-16 overflow-hidden rounded-lg border border-border"
      >
        <img
          :src="file.url"
          :alt="file.filename ?? 'Rasm'"
          class="size-full object-cover"
        />
      </div>

      <!-- File preview -->
      <div
        v-else
        class="flex h-16 items-center gap-2 rounded-lg border border-border bg-muted px-3"
      >
        <FileIcon class="size-5 shrink-0 text-muted-foreground" />
        <span class="max-w-[120px] truncate text-xs">
          {{ file.filename ?? 'Fayl' }}
        </span>
      </div>

      <!-- Remove button -->
      <Button
        variant="destructive"
        size="icon-xs"
        class="absolute -right-1.5 -top-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
        @click="removeFile(file.id)"
      >
        <XIcon class="size-3" />
      </Button>
    </div>
  </div>
</template>
