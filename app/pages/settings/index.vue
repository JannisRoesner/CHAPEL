<script setup lang="ts">
import { useOnline } from '@vueuse/core'
import {
  ADMIN_SETTINGS_SECTIONS,
  DEFAULT_OPEN_ADMIN_SECTIONS,
  DEFAULT_OPEN_PERSONAL_SECTIONS,
  PERSONAL_SETTINGS_SECTIONS,
  SETTINGS_SECTION_IDS
} from '#shared/constants/settingsSections'

const { user } = useUserSession()
const online = useOnline()
const localSession = useLocalSession()

const isAdmin = computed(() => {
  return user.value?.role === 'admin'
    || localSession.getLocalSession()?.user.role === 'admin'
})

const personalItems = computed(() =>
  PERSONAL_SETTINGS_SECTIONS.filter((item) => {
    if (!online.value) {
      return item.value === SETTINGS_SECTION_IDS.offline
        || item.value === SETTINGS_SECTION_IDS.appearance
    }
    if (item.value === SETTINGS_SECTION_IDS.password) {
      return !user.value?.mustChangePassword
    }
    return true
  })
)

const showAdmin = computed(() => isAdmin.value && online.value)
</script>

<template>
  <div class="space-y-8">
    <UiPageHeader
      title="Einstellungen"
      description="Darstellung, Benutzer und Offline-Speicher"
    />

    <UAlert
      v-if="!online"
      color="warning"
      variant="subtle"
      title="Offline-Modus"
      description="Nur Darstellung und Offline-Cache sind ohne Netzwerk verfügbar."
    />

    <div class="space-y-3">
      <p class="text-sm font-semibold text-muted uppercase tracking-wide">
        Persönlich
      </p>
      <SettingsAccordion
        :items="personalItems"
        :default-open="online ? DEFAULT_OPEN_PERSONAL_SECTIONS : [SETTINGS_SECTION_IDS.offline]"
      >
        <template #appearance>
          <SettingsAppearanceSection />
        </template>
        <template #password>
          <SettingsPasswordSection />
        </template>
        <template #offline>
          <SettingsOfflineCacheSection />
        </template>
      </SettingsAccordion>
    </div>

    <div
      v-if="showAdmin"
      class="space-y-3"
    >
      <p class="text-sm font-semibold text-muted uppercase tracking-wide">
        Administration
      </p>
      <SettingsAccordion
        :items="ADMIN_SETTINGS_SECTIONS"
        :default-open="DEFAULT_OPEN_ADMIN_SECTIONS"
      >
        <template #branding>
          <SettingsBrandingSection />
        </template>
        <template #legal>
          <SettingsLegalSection />
        </template>
        <template #users>
          <SettingsUsersSection />
        </template>
      </SettingsAccordion>
    </div>
  </div>
</template>
