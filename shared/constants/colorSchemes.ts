export type ColorSchemeId
  = | 'chapel-green'
    | 'liturgical-blue'
    | 'golden-liturgy'
    | 'advent-purple'
    | 'forest-calm'

export type AppearanceMode = 'system' | 'light' | 'dark'

export interface ColorSchemeDefinition {
  id: ColorSchemeId
  name: string
  description: string
  preview: [string, string, string]
}

export const COLOR_SCHEMES: ColorSchemeDefinition[] = [
  {
    id: 'chapel-green',
    name: 'Chapel Grün',
    description: 'Frisches Grün – der klassische CHAPEL-Look',
    preview: ['#EFFDF5', '#00C16A', '#052E16']
  },
  {
    id: 'liturgical-blue',
    name: 'Liturgisch Blau',
    description: 'Tiefes Blau, ruhig und sakral',
    preview: ['#EFF6FF', '#2563EB', '#172554']
  },
  {
    id: 'golden-liturgy',
    name: 'Goldenes Ambiente',
    description: 'Warmes Gold, festlich und einladend',
    preview: ['#FFFBEB', '#D97706', '#451A03']
  },
  {
    id: 'advent-purple',
    name: 'Advent Violett',
    description: 'Gedämpftes Violett, würdevoll',
    preview: ['#F5F3FF', '#7C3AED', '#2E1065']
  },
  {
    id: 'forest-calm',
    name: 'Waldgrün',
    description: 'Gedämpftes Teal, natürlich und ruhig',
    preview: ['#F0FDFA', '#0D9488', '#042F2E']
  }
]

export const DEFAULT_COLOR_SCHEME: ColorSchemeId = 'chapel-green'
export const DEFAULT_APPEARANCE_MODE: AppearanceMode = 'system'

export const COLOR_SCHEME_IDS = COLOR_SCHEMES.map(scheme => scheme.id)

export function isColorSchemeId(value: string): value is ColorSchemeId {
  return COLOR_SCHEME_IDS.includes(value as ColorSchemeId)
}

export function isAppearanceMode(value: string): value is AppearanceMode {
  return value === 'system' || value === 'light' || value === 'dark'
}
