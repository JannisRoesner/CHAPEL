import type { RouteLocationRaw } from 'vue-router'

export const APP_NAME = 'CHAPEL'
export const APP_TAGLINE = 'Church Hymn Audio Playlist Engine for Liturgy'
export const LOGIN_QUERY = { login: '1' } as const
export const LOGIN_PATH = '/?login=1'
export const LOGIN_ROUTE: RouteLocationRaw = { path: '/', query: LOGIN_QUERY }
export const DEFAULT_ROUTE = '/playback'

export interface AppNavItem {
  to: string
  label: string
  icon: string
  primary?: boolean
}

export const APP_NAV_ITEMS: AppNavItem[] = [
  { to: '/library', label: 'Bibliothek', icon: 'book' },
  { to: '/service-types', label: 'Vorlagen', icon: 'list' },
  { to: '/services', label: 'Gottesdienste', icon: 'calendar' },
  { to: '/playback', label: 'Wiedergabe', icon: 'play', primary: true },
  { to: '/settings', label: 'Einstellungen', icon: 'cog' }
]
