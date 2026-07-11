<script setup lang="ts">
import { DEFAULT_ROUTE } from '#shared/constants/app'

const appearanceOpen = ref(false)
const { loggedIn } = useUserSession()

function openAppearance() {
  appearanceOpen.value = true
}
</script>

<template>
  <header class="border-b border-default bg-elevated/80 backdrop-blur sticky top-0 z-50">
    <div class="max-w-6xl mx-auto px-4 min-h-14 py-2 flex items-center justify-between gap-4">
      <NuxtLink
        to="/"
        class="shrink-0 min-w-0"
      >
        <UiAppLogo />
      </NuxtLink>

      <nav class="hidden sm:flex items-center gap-6 text-sm">
        <a
          href="#features"
          class="text-muted hover:text-default transition-colors"
        >
          Funktionen
        </a>
        <a
          href="#ablauf"
          class="text-muted hover:text-default transition-colors"
        >
          Ablauf
        </a>
      </nav>

      <div class="flex items-center gap-2 shrink-0">
        <UButton
          variant="ghost"
          size="sm"
          aria-label="Erscheinungsbild anpassen"
          class="gap-1.5"
          @click="openAppearance"
        >
          <FontAwesomeIcon icon="palette" />
          <span class="hidden sm:inline">Darstellung</span>
        </UButton>
        <UButton
          v-if="loggedIn"
          :to="DEFAULT_ROUTE"
          color="primary"
          size="sm"
          class="justify-center"
        >
          Zur App
        </UButton>
        <UButton
          v-else
          to="/login"
          color="primary"
          size="sm"
          class="justify-center"
        >
          Anmelden
        </UButton>
      </div>
    </div>

    <LandingAppearanceModal v-model:open="appearanceOpen" />
  </header>
</template>
