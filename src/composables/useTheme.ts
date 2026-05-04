import { useColorMode } from '@vueuse/core'
import { computed } from 'vue'

export function useTheme() {
  const mode = useColorMode({
    attribute: 'class',
    modes: {
      dark: 'dark',
      light: '',
    },
  })

  const isDark = computed(() => mode.value === 'dark')

  function toggle() {
    mode.value = isDark.value ? 'light' : 'dark'
  }

  return { isDark, mode, toggle }
}
