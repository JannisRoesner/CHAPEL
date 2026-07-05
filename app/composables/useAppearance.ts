import type { AppearanceMode, ColorSchemeId } from '#shared/constants/colorSchemes'
import {
  DEFAULT_APPEARANCE_MODE,
  DEFAULT_COLOR_SCHEME,
  isAppearanceMode,
  isColorSchemeId
} from '#shared/constants/colorSchemes'

function applyColorScheme(scheme: ColorSchemeId) {
  if (!import.meta.client) return
  document.documentElement.dataset.colorScheme = scheme
}

function applyAppearanceMode(mode: AppearanceMode, colorMode: ReturnType<typeof useColorMode>) {
  colorMode.preference = mode
}

export function useAppearance() {
  const colorMode = useColorMode()
  const { user, fetch: refreshSession } = useUserSession()

  const colorScheme = computed<ColorSchemeId>(() => {
    const value = user.value?.colorScheme
    return value && isColorSchemeId(value) ? value : DEFAULT_COLOR_SCHEME
  })

  const appearanceMode = computed<AppearanceMode>(() => {
    const value = user.value?.appearanceMode
    return value && isAppearanceMode(value) ? value : DEFAULT_APPEARANCE_MODE
  })

  function applyFromSession() {
    applyColorScheme(colorScheme.value)
    applyAppearanceMode(appearanceMode.value, colorMode)
  }

  if (import.meta.client) {
    watch([colorScheme, appearanceMode], () => {
      applyFromSession()
    }, { immediate: true })
  }

  async function savePreferences(input: {
    colorScheme?: ColorSchemeId
    appearanceMode?: AppearanceMode
  }) {
    const updated = await $fetch('/api/users/me/preferences', {
      method: 'PATCH',
      body: input
    })
    await refreshSession()
    if (input.colorScheme) {
      applyColorScheme(input.colorScheme)
    }
    if (input.appearanceMode) {
      applyAppearanceMode(input.appearanceMode, colorMode)
    }
    return updated
  }

  return {
    colorScheme,
    appearanceMode,
    colorMode,
    applyFromSession,
    savePreferences
  }
}
