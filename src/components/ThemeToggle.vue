<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { useTheme } from '@/composables/useTheme'
import { MoonIcon, SunIcon } from 'lucide-vue-next'

const { isDark, toggle } = useTheme()
</script>

<template>
  <Button
    variant="ghost"
    size="icon"
    @click="toggle"
    :aria-label="isDark ? 'Yorug\' rejim' : 'Qorong\'u rejim'"
  >
    <SunIcon v-if="isDark" class="size-5" />
    <MoonIcon v-else class="size-5" />
  </Button>
</template>
