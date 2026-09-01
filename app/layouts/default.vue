<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { APP_NAV_ITEMS, DEFAULT_ROUTE, LOGIN_PATH } from '#shared/constants/app'
import { useOnline } from '@vueuse/core'

const colorMode = useColorMode()
const route = useRoute()
const { user, loggedIn } = useUserSession()
const online = useOnline()
const localSession = useLocalSession()

const isOfflineMode = computed(() => !online.value)
const displayName = computed(() => {
  return user.value?.name || localSession.getLocalSession()?.user.name || null
})

const navItems = computed(() => {
  if (!isOfflineMode.value) return APP_NAV_ITEMS
  return APP_NAV_ITEMS.filter(item => item.to === '/playback' || item.to === '/settings')
})

useHead({
  htmlAttrs: {
    lang: 'de'
  }
})

function isNavActive(to: string) {
  return route.path === to || route.path.startsWith(`${to}/`)
}

async function logout() {
  useLocalSession().clearLocalSession()
  await $fetch('/api/auth/logout', { method: 'POST' })
  await navigateTo('/')
}

function cycleTheme() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

const accountItems = computed<DropdownMenuItem[][]>(() => {
  const items: DropdownMenuItem[] = [
    {
      label: colorMode.value === 'dark' ? 'Hellmodus' : 'Dunkelmodus',
      icon: colorMode.value === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon',
      onSelect: () => cycleTheme()
    }
  ]

  if (loggedIn.value && online.value) {
    items.push({
      label: 'Abmelden',
      icon: 'i-lucide-log-out',
      onSelect: () => {
        void logout()
      }
    })
  } else if (online.value && !loggedIn.value) {
    items.push({
      label: 'Anmelden',
      icon: 'i-lucide-log-in',
      to: LOGIN_PATH
    })
  }

  return [items]
})
</script>

<template>
  <UApp :class="colorMode.value">
    <div class="min-h-screen bg-default text-default grid grid-rows-[auto_1fr_auto]">
      <header class="border-b border-default bg-elevated/80 backdrop-blur sticky top-0 z-50 overflow-x-clip">
        <div class="w-full max-w-6xl mx-auto px-4 min-h-14 py-2 flex items-center gap-x-4">
          <NuxtLink
            :to="DEFAULT_ROUTE"
            class="flex-1 min-w-0"
          >
            <UiAppLogo compact />
          </NuxtLink>

          <nav class="hidden md:flex items-center gap-1">
            <UButton
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              :variant="isNavActive(item.to) ? 'soft' : 'ghost'"
              :color="isNavActive(item.to) || item.primary ? 'primary' : 'neutral'"
              class="gap-2 min-h-11"
            >
              <FontAwesomeIcon
                :icon="item.icon"
                class="size-4 shrink-0 opacity-80"
              />
              {{ item.label }}
            </UButton>
          </nav>

          <div class="hidden md:flex items-center gap-2 shrink-0">
            <span
              v-if="displayName"
              class="text-sm text-muted max-w-32 truncate"
            >
              {{ displayName }}
            </span>
            <UiThemeToggle />
            <UButton
              v-if="loggedIn && online"
              variant="ghost"
              color="neutral"
              class="min-h-11 min-w-11"
              aria-label="Abmelden"
              @click="logout"
            >
              <FontAwesomeIcon icon="sign-out-alt" />
            </UButton>
            <UButton
              v-else-if="online && !loggedIn"
              :to="LOGIN_PATH"
              variant="ghost"
              color="neutral"
              class="min-h-11"
            >
              Anmelden
            </UButton>
          </div>

          <div class="md:hidden shrink-0">
            <UDropdownMenu :items="accountItems">
              <UButton
                variant="ghost"
                color="neutral"
                icon="i-lucide-user"
                class="min-w-11 min-h-11"
                aria-label="Konto"
              />
            </UDropdownMenu>
          </div>
        </div>
      </header>

      <div
        v-if="isOfflineMode"
        class="border-b border-warning/30 bg-warning/10"
      >
        <div class="w-full max-w-6xl mx-auto px-4 py-3">
          <p class="font-medium text-warning">
            Offline-Modus
          </p>
          <p class="text-sm text-warning/90 mt-0.5">
            Nur Wiedergabe und Cache-Verwaltung verfügbar
          </p>
        </div>
      </div>

      <main class="w-full min-w-0 max-w-6xl mx-auto px-4 py-6 pb-[calc(6.5rem+env(safe-area-inset-bottom))] md:pb-6">
        <slot />
      </main>

      <footer class="border-t border-default bg-elevated/30 mb-[calc(5.25rem+env(safe-area-inset-bottom))] md:mb-0">
        <div class="w-full max-w-6xl mx-auto px-4 py-3 md:py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted">
          <UiCopyrightNotice />
          <LegalFooterLinks />
        </div>
      </footer>

      <UiBottomNav :items="navItems" />

      <AuthChangePasswordModal v-if="user?.mustChangePassword" />
    </div>
  </UApp>
</template>
