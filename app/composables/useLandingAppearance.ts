import type { AppearanceMode, ColorSchemeId } from '#shared/constants/colorSchemes'
import {
  DEFAULT_APPEARANCE_MODE,
  DEFAULT_COLOR_SCHEME,
  isAppearanceMode,
  isColorSchemeId
} from '#shared/constants/colorSchemes'

const STORAGE_KEY = 'chapel-landing-appearance'

interface LandingAppearancePrefs {
  colorScheme: ColorSchemeId
  appearanceMode: AppearanceMode
}

function readPrefs(): LandingAppearancePrefs {
  if (!import.meta.client) {
    return { colorScheme: DEFAULT_COLOR_SCHEME, appearanceMode: DEFAULT_APPEARANCE_MODE }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return { colorScheme: DEFAULT_COLOR_SCHEME, appearanceMode: DEFAULT_APPEARANCE_MODE }
    }
    const parsed = JSON.parse(raw) as Partial<LandingAppearancePrefs>
    return {
      colorScheme: parsed.colorScheme && isColorSchemeId(parsed.colorScheme)
        ? parsed.colorScheme
        : DEFAULT_COLOR_SCHEME,
      appearanceMode: parsed.appearanceMode && isAppearanceMode(parsed.appearanceMode)
        ? parsed.appearanceMode
        : DEFAULT_APPEARANCE_MODE
    }
  } catch {
    return { colorScheme: DEFAULT_COLOR_SCHEME, appearanceMode: DEFAULT_APPEARANCE_MODE }
  }
}

function writePrefs(prefs: LandingAppearancePrefs) {
  if (!import.meta.client) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
}

function applyColorScheme(scheme: ColorSchemeId) {
  if (!import.meta.client) return
  document.documentElement.dataset.colorScheme = scheme
}

export function useLandingAppearance() {
  const colorMode = useColorMode()
  const { loggedIn } = useUserSession()
  const { colorScheme: sessionScheme, appearanceMode: sessionMode } = useAppearance()

  const prefs = useState<LandingAppearancePrefs>('landing-appearance-prefs', () => ({
    colorScheme: DEFAULT_COLOR_SCHEME,
    appearanceMode: DEFAULT_APPEARANCE_MODE
  }))

  if (import.meta.client && !loggedIn.value) {
    prefs.value = readPrefs()
  }

  const colorScheme = computed(() =>
    loggedIn.value ? sessionScheme.value : prefs.value.colorScheme
  )

  const appearanceMode = computed(() =>
    loggedIn.value ? sessionMode.value : prefs.value.appearanceMode
  )

  function apply() {
    applyColorScheme(colorScheme.value)
    colorMode.preference = appearanceMode.value
  }

  if (import.meta.client) {
    watch([colorScheme, appearanceMode, loggedIn], apply, { immediate: true })
  }

  function setColorScheme(scheme: ColorSchemeId) {
    if (loggedIn.value) return
    prefs.value = { ...prefs.value, colorScheme: scheme }
    writePrefs(prefs.value)
    applyColorScheme(scheme)
  }

  function setAppearanceMode(mode: AppearanceMode) {
    if (loggedIn.value) return
    prefs.value = { ...prefs.value, appearanceMode: mode }
    writePrefs(prefs.value)
    colorMode.preference = mode
  }

  return {
    colorScheme,
    appearanceMode,
    colorMode,
    setColorScheme,
    setAppearanceMode
  }
}
