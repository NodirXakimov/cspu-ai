<script setup lang="ts">
import { LANGS, useI18n } from '@/composables/useI18n'

const { lang } = useI18n()
</script>

<template>
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
</template>
