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
  const { getLocalSession } = useLocalSession()

  const sessionUser = computed(() => {
    return user.value ?? getLocalSession()?.user ?? null
  })

  const colorScheme = computed<ColorSchemeId>(() => {
    const value = sessionUser.value?.colorScheme
    return value && isColorSchemeId(value) ? value : DEFAULT_COLOR_SCHEME
  })

  const appearanceMode = computed<AppearanceMode>(() => {
    const value = sessionUser.value?.appearanceMode
    return value && isAppearanceMode(value) ? value : DEFAULT_APPEARANCE_MODE
  })

  function applyFromSession() {
    applyColorScheme(colorScheme.value)
    applyAppearanceMode(appearanceMode.value, colorMode)
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
    if (user.value) {
      useLocalSession().saveLocalSession(user.value)
    }
    if (input.colorScheme) {
      applyColorScheme(input.colorScheme)
    }
    if (input.appearanceMode) {
      applyAppearanceMode(input.appearanceMode, colorMode)
    }
    return updated
  }

  /**
   * Einziger Weg, den Modus zu ändern: sofort anwenden und – wenn angemeldet – im Profil
   * speichern. Sonst würde der gespeicherte Wert beim nächsten Seitenwechsel zurückspringen.
   */
  async function setAppearanceMode(mode: AppearanceMode) {
    applyAppearanceMode(mode, colorMode)
    if (!user.value || mode === appearanceMode.value) return
    try {
      await savePreferences({ appearanceMode: mode })
    } catch {
      useToast().add({ title: 'Darstellung konnte nicht gespeichert werden', color: 'error' })
    }
  }

  /** Sonne/Mond: zwischen Hell und Dunkel wechseln (ausgehend vom aktuell sichtbaren Modus) */
  function toggleDarkMode() {
    return setAppearanceMode(colorMode.value === 'dark' ? 'light' : 'dark')
  }

  return {
    colorScheme,
    appearanceMode,
    colorMode,
    applyFromSession,
    savePreferences,
    setAppearanceMode,
    toggleDarkMode
  }
}
