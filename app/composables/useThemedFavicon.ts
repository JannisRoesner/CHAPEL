import { buildChapelIconDataUrl, CHAPEL_ICON_BACKGROUND } from '#shared/constants/chapelIcon'

function readThemeColor(cssVar: string, fallback: string): string {
  if (!import.meta.client) return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim()
  return value || fallback
}

export function useThemedFavicon() {
  const { branding } = useBranding()
  const { colorScheme } = useAppearance()

  const faviconHref = ref('/favicon.svg')

  function refreshFavicon() {
    if (!import.meta.client) return

    if (branding.value.hasCustomLogo) {
      faviconHref.value = branding.value.faviconUrl
      return
    }

    const primaryColor = readThemeColor('--color-green-500', '#00C16A')
    faviconHref.value = buildChapelIconDataUrl(primaryColor, CHAPEL_ICON_BACKGROUND)
  }

  if (import.meta.client) {
    watch([() => branding.value.hasCustomLogo, () => branding.value.faviconUrl, colorScheme], () => {
      nextTick(refreshFavicon)
    }, { immediate: true })
  }

  useHead(() => ({
    link: [
      {
        rel: 'icon',
        type: branding.value.hasCustomLogo && !faviconHref.value.startsWith('data:image/svg')
          ? 'image/png'
          : 'image/svg+xml',
        href: faviconHref.value
      }
    ]
  }))

  return { faviconHref, refreshFavicon }
}
