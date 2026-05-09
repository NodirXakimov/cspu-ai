<script setup lang="ts">
import { useToast } from '@/composables/useToast'
import { CheckCircle2Icon, XCircleIcon, InfoIcon, XIcon } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const { toasts, dismiss } = useToast()

const ICON = {
  default: InfoIcon,
  success: CheckCircle2Icon,
  error: XCircleIcon,
}
</script>

<template>
  <Teleport to="body">
    <div
      class="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4"
      aria-live="polite"
    >
      <TransitionGroup
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in absolute"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div
          v-for="t in toasts"
          :key="t.id"
          :class="cn(
            'pointer-events-auto flex w-full max-w-sm items-center gap-2 rounded-lg border bg-background px-4 py-3 shadow-lg',
            t.variant === 'success' && 'border-emerald-500/40',
            t.variant === 'error' && 'border-destructive/50',
          )"
          role="status"
        >
          <component
            :is="ICON[t.variant]"
            :class="cn(
              'size-4 shrink-0',
              t.variant === 'success' && 'text-emerald-500',
              t.variant === 'error' && 'text-destructive',
              t.variant === 'default' && 'text-muted-foreground',
            )"
          />
          <p class="flex-1 text-sm">{{ t.message }}</p>
          <button
            class="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Yopish"
            @click="dismiss(t.id)"
          >
            <XIcon class="size-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
