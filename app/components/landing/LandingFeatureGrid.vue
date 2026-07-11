<script setup lang="ts">
import { LANDING_MORE_FEATURES } from '#shared/constants/landingDemo'
</script>

<template>
  <section
    id="features-more"
    class="py-16 md:py-24"
    aria-labelledby="more-features-heading"
  >
    <div class="max-w-6xl mx-auto px-4">
      <h2
        id="more-features-heading"
        class="text-3xl md:text-4xl font-bold text-center mb-4"
      >
        Und mehr! Alles für den reibungslosen Gottesdienst
      </h2>
      <p class="text-muted text-center mb-12 max-w-2xl mx-auto">
        CHAPEL deckt den gesamten Weg ab — von der Vorbereitung bis zur Wiedergabe am Sonntag.
      </p>

      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <UCard
          v-for="feature in LANDING_MORE_FEATURES"
          :key="feature.title"
          class="h-full"
        >
          <div class="flex items-start gap-4">
            <div class="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FontAwesomeIcon
                :icon="feature.icon"
                class="text-primary"
              />
            </div>
            <div>
              <h3 class="font-semibold mb-1">
                {{ feature.title }}
              </h3>
              <p class="text-sm text-muted leading-relaxed">
                {{ feature.description }}
              </p>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </section>
</template>
