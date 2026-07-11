<script setup lang="ts">
import { DEFAULT_ROUTE } from '#shared/constants/app'
import { LANDING_FEATURES } from '#shared/constants/landingDemo'
import LandingPreviewLibrary from '~/components/landing/previews/LandingPreviewLibrary.vue'
import LandingPreviewOffline from '~/components/landing/previews/LandingPreviewOffline.vue'
import LandingPreviewPlayback from '~/components/landing/previews/LandingPreviewPlayback.vue'
import LandingPreviewRealtime from '~/components/landing/previews/LandingPreviewRealtime.vue'
import LandingPreviewService from '~/components/landing/previews/LandingPreviewService.vue'
import LandingPreviewServiceType from '~/components/landing/previews/LandingPreviewServiceType.vue'

definePageMeta({
  layout: 'landing'
})

const { loggedIn, fetch: fetchSession } = useUserSession()

await fetchSession()

if (loggedIn.value) {
  await navigateTo(DEFAULT_ROUTE, { replace: true })
}

useSeoMeta({
  title: 'CHAPEL — Liturgie-Audio einfach steuern',
  description: 'CHAPEL verwaltet Gottesdienst-Playlists: Liturgieelemente sind fix, Lieder frei wählbar — touch-gesteuert abspielbar, auch offline.',
  ogTitle: 'CHAPEL — Liturgie-Audio einfach steuern',
  ogDescription: 'Moderne Web-App zur Verwaltung und touch-gesteuerten Wiedergabe von Gottesdienst-Playlists für Ihre Gemeinde.'
})

const previewById: Record<string, Component> = {
  library: LandingPreviewLibrary,
  'service-types': LandingPreviewServiceType,
  services: LandingPreviewService,
  playback: LandingPreviewPlayback,
  realtime: LandingPreviewRealtime,
  offline: LandingPreviewOffline
}
</script>

<template>
  <div v-if="!loggedIn">
    <LandingHero />

    <section
      id="features"
      class="border-t border-default"
      aria-labelledby="features-heading"
    >
      <div class="max-w-6xl mx-auto px-4 pt-16 pb-4">
        <h2
          id="features-heading"
          class="text-3xl md:text-4xl font-bold text-center mb-4"
        >
          Funktionen für die Gottesdienst-Vorbereitung
        </h2>
        <p class="text-muted text-center max-w-2xl mx-auto">
          Alles, was Ihre Gemeinde braucht — von der Audiobibliothek bis zur Touch-Wiedergabe.
        </p>
      </div>

      <LandingFeatureSection
        v-for="(feature, index) in LANDING_FEATURES"
        :key="feature.id"
        :title="feature.title"
        :description="feature.description"
        :hint="feature.hint"
        :reverse="index % 2 === 1"
      >
        <template #preview>
          <component :is="previewById[feature.id]" />
        </template>
      </LandingFeatureSection>
    </section>

    <LandingFeatureGrid />
    <LandingWorkflow />
    <LandingCta />
  </div>
</template>
