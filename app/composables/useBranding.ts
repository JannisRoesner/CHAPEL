export interface BrandingState {
  hasCustomLogo: boolean
  logoUrl: string
  faviconUrl: string
}

const defaultBranding: BrandingState = {
  hasCustomLogo: false,
  logoUrl: '/favicon.svg',
  faviconUrl: '/favicon.svg'
}

export function useBranding() {
  const branding = useState<BrandingState>('branding', () => ({ ...defaultBranding }))
  const loaded = useState('branding-loaded', () => false)

  async function fetchBranding() {
    try {
      branding.value = await $fetch<BrandingState>('/api/branding')
    } catch {
      branding.value = { ...defaultBranding }
    } finally {
      loaded.value = true
    }
  }

  if (import.meta.client && !loaded.value) {
    fetchBranding()
  }

  useHead(() => ({
    link: [
      {
        rel: 'icon',
        type: branding.value.faviconUrl.endsWith('.svg') ? 'image/svg+xml' : 'image/png',
        href: branding.value.faviconUrl
      }
    ]
  }))

  return {
    branding: readonly(branding),
    loaded: readonly(loaded),
    fetchBranding
  }
}
