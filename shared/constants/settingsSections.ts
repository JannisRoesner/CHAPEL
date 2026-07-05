import type { AccordionItem } from '@nuxt/ui'

export const SETTINGS_SECTION_IDS = {
  appearance: 'appearance',
  password: 'password',
  offline: 'offline',
  branding: 'branding',
  users: 'users'
} as const

export type SettingsSectionId = typeof SETTINGS_SECTION_IDS[keyof typeof SETTINGS_SECTION_IDS]

export interface SettingsSectionDefinition extends AccordionItem {
  value: SettingsSectionId
  slot: SettingsSectionId
}

export const PERSONAL_SETTINGS_SECTIONS: SettingsSectionDefinition[] = [
  {
    label: 'Darstellung',
    value: SETTINGS_SECTION_IDS.appearance,
    slot: SETTINGS_SECTION_IDS.appearance,
    icon: 'i-lucide-palette'
  },
  {
    label: 'Passwort ändern',
    value: SETTINGS_SECTION_IDS.password,
    slot: SETTINGS_SECTION_IDS.password,
    icon: 'i-lucide-key'
  },
  {
    label: 'Offline-Cache',
    value: SETTINGS_SECTION_IDS.offline,
    slot: SETTINGS_SECTION_IDS.offline,
    icon: 'i-lucide-cloud-download'
  }
]

export const ADMIN_SETTINGS_SECTIONS: SettingsSectionDefinition[] = [
  {
    label: 'Branding',
    value: SETTINGS_SECTION_IDS.branding,
    slot: SETTINGS_SECTION_IDS.branding,
    icon: 'i-lucide-image'
  },
  {
    label: 'Benutzerverwaltung',
    value: SETTINGS_SECTION_IDS.users,
    slot: SETTINGS_SECTION_IDS.users,
    icon: 'i-lucide-users'
  }
]

export const DEFAULT_OPEN_PERSONAL_SECTIONS = [SETTINGS_SECTION_IDS.appearance]
export const DEFAULT_OPEN_ADMIN_SECTIONS = [SETTINGS_SECTION_IDS.users]
