<script setup lang="ts">
import { LOGIN_PATH } from '#shared/constants/app'
</script>

<template>
  <section class="py-16 md:py-20 bg-elevated/30">
    <div class="max-w-6xl mx-auto px-4 text-center">
      <h2 class="text-3xl md:text-4xl font-bold mb-4">
        Bereit für CHAPEL?
      </h2>
      <p class="text-muted text-lg mb-8 max-w-xl mx-auto">
        Melden Sie sich an und starten Sie mit der Wiedergabe.
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
