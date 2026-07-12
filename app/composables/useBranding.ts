export interface BrandingState {
  hasCustomLogo: boolean
  logoUrl: string
  faviconUrl: string
  copyrightHolder: string
}

const defaultBranding: BrandingState = {
  hasCustomLogo: false,
  logoUrl: '/favicon.svg',
  faviconUrl: '/favicon.svg',
  copyrightHolder: ''
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

  return {
    branding: readonly(branding),
    loaded: readonly(loaded),
    fetchBranding
  }
}
