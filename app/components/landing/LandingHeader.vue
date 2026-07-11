<script setup lang="ts">
import { DEFAULT_ROUTE } from '#shared/constants/app'

const appearanceOpen = ref(false)
const mobileMenuOpen = ref(false)
const { loggedIn } = useUserSession()

const mobileNavItemClass = 'justify-start gap-3 min-h-11 py-3 px-4 text-base'

function openAppearance() {
  mobileMenuOpen.value = false
  appearanceOpen.value = true
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
}

function scrollToSection(id: string) {
  closeMobileMenu()
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <header class="border-b border-default bg-elevated/80 backdrop-blur sticky top-0 z-50 overflow-x-clip">
    <div class="max-w-6xl mx-auto px-4 min-h-14 py-2 flex flex-wrap items-center gap-x-4 gap-y-2">
      <NuxtLink
        to="/"
        class="flex-1 min-w-0"
      >
        <UiAppLogo compact />
      </NuxtLink>

      <nav class="hidden md:flex items-center gap-6 text-sm">
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

      <div class="hidden md:flex items-center gap-2 shrink-0">
        <UButton
          variant="ghost"
          size="sm"
          aria-label="Erscheinungsbild anpassen"
          class="gap-1.5"
          @click="openAppearance"
        >
          <FontAwesomeIcon icon="palette" />
          Darstellung
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

      <UiMobileNavPanel v-model:open="mobileMenuOpen">
        <UButton
          variant="ghost"
          block
          :class="mobileNavItemClass"
          @click="scrollToSection('features')"
        >
          <FontAwesomeIcon
            icon="star"
            class="size-5 shrink-0 opacity-70"
          />
          Funktionen
        </UButton>
        <UButton
          variant="ghost"
          block
          :class="mobileNavItemClass"
          @click="scrollToSection('ablauf')"
        >
          <FontAwesomeIcon
            icon="list-ol"
            class="size-5 shrink-0 opacity-70"
          />
          Ablauf
        </UButton>

        <template #footer>
          <UButton
            variant="ghost"
            block
            :class="mobileNavItemClass"
            aria-label="Erscheinungsbild anpassen"
            @click="openAppearance"
          >
            <FontAwesomeIcon
              icon="palette"
              class="size-5 shrink-0 opacity-70"
            />
            Darstellung
          </UButton>
          <UButton
            v-if="loggedIn"
            :to="DEFAULT_ROUTE"
            variant="ghost"
            block
            :class="mobileNavItemClass"
            @click="closeMobileMenu"
          >
            <FontAwesomeIcon
              icon="play"
              class="size-5 shrink-0 opacity-70"
            />
            Zur App
          </UButton>
          <UButton
            v-else
            to="/login"
            variant="ghost"
            block
            :class="mobileNavItemClass"
            @click="closeMobileMenu"
          >
            <FontAwesomeIcon
              icon="sign-in-alt"
              class="size-5 shrink-0 opacity-70"
            />
            Anmelden
          </UButton>
        </template>
      </UiMobileNavPanel>
    </div>

    <LandingAppearanceModal v-model:open="appearanceOpen" />
  </header>
</template>
