export const LEGAL_SETTING_KEYS = {
  impressum: 'legal_impressum',
  privacy: 'legal_privacy'
} as const

export const LEGAL_ROUTES = {
  impressum: '/impressum',
  privacy: '/datenschutz'
} as const

export interface LegalContent {
  impressum: string
  privacy: string
}

export const PUBLIC_PATHS = [
  '/',
  LEGAL_ROUTES.impressum,
  LEGAL_ROUTES.privacy
] as const
