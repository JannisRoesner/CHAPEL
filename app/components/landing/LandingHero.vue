<script setup lang="ts">
import { LOGIN_PATH } from '#shared/constants/app'
</script>

<template>
  <section class="relative overflow-hidden py-20 md:py-28">
    <div
      class="absolute inset-0 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent pointer-events-none"
      aria-hidden="true"
    />

    <div class="relative max-w-6xl mx-auto px-4 text-center">
      <div class="flex justify-center mb-8">
        <UiChapelIcon size="lg" />
      </div>

      <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
        Liturgie-Audio einfach steuern
      </h1>

      <p class="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
        CHAPEL verwaltet Gottesdienst-Playlists: Liturgieelemente sind fix, Lieder pro Gottesdienst
        frei wählbar — touch-gesteuert abspielbar, auch offline.
      </p>

      <UButton
        :to="LOGIN_PATH"
        color="primary"
        size="xl"
        class="min-w-40 justify-center"
      >
        Anmelden
      </UButton>
    </div>
  </section>
</template>
