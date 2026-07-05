<script setup lang="ts">
import {
  ADMIN_SETTINGS_SECTIONS,
  DEFAULT_OPEN_ADMIN_SECTIONS,
  DEFAULT_OPEN_PERSONAL_SECTIONS,
  PERSONAL_SETTINGS_SECTIONS,
  SETTINGS_SECTION_IDS
} from '#shared/constants/settingsSections'

const { user } = useUserSession()

const isAdmin = computed(() => user.value?.role === 'admin')

const personalItems = computed(() =>
  PERSONAL_SETTINGS_SECTIONS.filter((item) => {
    if (item.value === SETTINGS_SECTION_IDS.password) {
      return !user.value?.mustChangePassword
    }
    return true
  })
)
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-semibold mb-1">
        Einstellungen
      </h1>
      <p class="text-muted">
        Darstellung, Benutzer und Offline-Speicher
      </p>
    </div>

    <div class="space-y-3">
      <p class="text-sm font-medium text-muted uppercase tracking-wide">
        Persönlich
      </p>
      <SettingsAccordion
        :items="personalItems"
        :default-open="DEFAULT_OPEN_PERSONAL_SECTIONS"
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
      v-if="isAdmin"
      class="space-y-3"
    >
      <p class="text-sm font-medium text-muted uppercase tracking-wide">
        Administration
      </p>
      <SettingsAccordion
        :items="ADMIN_SETTINGS_SECTIONS"
        :default-open="DEFAULT_OPEN_ADMIN_SECTIONS"
      >
        <template #branding>
          <SettingsBrandingSection />
        </template>
        <template #users>
          <SettingsUsersSection />
        </template>
      </SettingsAccordion>
    </div>
  </div>
</template>
