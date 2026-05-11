<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowLeftIcon, ConstructionIcon } from 'lucide-vue-next'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { LANGS, useI18n } from '@/composables/useI18n'

const props = defineProps<{ stub: 'q2' | 'q3' | 'q4' }>()

const { lang, t } = useI18n()

const titleKey = computed(() => `${props.stub}.title` as const)
</script>

<template>
  <div class="min-h-screen w-full bg-slate-50 text-slate-900 dark:bg-slate-800 dark:text-slate-100">
    <header class="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-600 dark:bg-slate-700/70 sm:px-6">
      <RouterLink
        to="/monitoring"
        class="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
      >
        <ArrowLeftIcon class="size-4" />
        {{ t('stub.back') }}
      </RouterLink>

      <div class="flex items-center gap-2">
        <select
          v-model="lang"
          class="cursor-pointer rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
        >
          <option
            v-for="l in LANGS"
            :key="l.code"
            :value="l.code"
            class="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100"
          >
            {{ l.short }}
          </option>
        </select>
        <ThemeToggle />
      </div>
    </header>

    <main class="mx-auto flex max-w-2xl flex-col items-center px-6 py-24 text-center">
      <div class="flex size-20 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400">
        <ConstructionIcon class="size-10" />
      </div>
      <h1 class="mt-6 text-2xl font-bold text-slate-900 dark:text-slate-100">
        {{ t(titleKey) }}
      </h1>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">{{ t('stub.title') }}</p>
      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ t('stub.subtitle') }}</p>
    </main>
  </div>
</template>
