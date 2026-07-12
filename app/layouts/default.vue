<script setup lang="ts">
import { APP_NAV_ITEMS, DEFAULT_ROUTE, LOGIN_PATH } from '#shared/constants/app'

const colorMode = useColorMode()
const route = useRoute()
const mobileMenuOpen = ref(false)
const { user, loggedIn } = useUserSession()

const mobileNavItemClass = 'justify-start gap-3 min-h-11 py-3 px-4 text-base'

useHead({
  htmlAttrs: {
    lang: 'de'
  }
})

watch(() => route.path, () => {
  mobileMenuOpen.value = false
})

async function logout() {
  mobileMenuOpen.value = false
  useOfflineSession().clearHadSession()
  await $fetch('/api/auth/logout', { method: 'POST' })
  await navigateTo('/')
}

function cycleTheme() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <UApp :class="colorMode.value">
    <div class="min-h-screen bg-default text-default grid grid-rows-[auto_1fr_auto]">
      <header class="border-b border-default bg-elevated/80 backdrop-blur sticky top-0 z-50 overflow-x-clip">
        <div class="w-full max-w-6xl mx-auto px-4 min-h-14 py-2 flex flex-wrap items-center gap-x-4 gap-y-2">
          <NuxtLink
            :to="DEFAULT_ROUTE"
            class="flex-1 min-w-0"
          >
            <UiAppLogo compact />
          </NuxtLink>

          <nav class="hidden md:flex items-center gap-1">
            <UButton
              v-for="item in APP_NAV_ITEMS"
              :key="item.to"
              :to="item.to"
              variant="ghost"
              size="sm"
              class="gap-1.5"
              :color="item.primary ? 'primary' : undefined"
            >
              <FontAwesomeIcon
                :icon="item.icon"
                class="size-3.5 shrink-0 opacity-70"
              />
              {{ item.label }}
            </UButton>
          </nav>

          <div class="hidden md:flex items-center gap-2 shrink-0">
            <UiThemeToggle />
            <UButton
              v-if="loggedIn"
              variant="ghost"
              size="sm"
              aria-label="Abmelden"
              @click="logout"
            >
              <FontAwesomeIcon icon="sign-out-alt" />
            </UButton>
            <UButton
              v-else
              :to="LOGIN_PATH"
              variant="ghost"
              size="sm"
            >
              Anmelden
            </UButton>
          </div>

          <UiMobileNavPanel v-model:open="mobileMenuOpen">
            <UButton
              v-for="item in APP_NAV_ITEMS"
              :key="item.to"
              :to="item.to"
              variant="ghost"
              block
              :class="mobileNavItemClass"
              :color="item.primary ? 'primary' : undefined"
            >
              <FontAwesomeIcon
                :icon="item.icon"
                class="size-5 shrink-0 opacity-70"
              />
              {{ item.label }}
            </UButton>

            <template #footer>
              <UButton
                variant="ghost"
                block
                :class="mobileNavItemClass"
                :aria-label="colorMode.value === 'dark' ? 'Hellmodus' : 'Dunkelmodus'"
                @click="cycleTheme"
              >
                <FontAwesomeIcon
                  :icon="colorMode.value === 'dark' ? 'sun' : 'moon'"
                  class="size-5 shrink-0 opacity-70"
                />
                {{ colorMode.value === 'dark' ? 'Hellmodus' : 'Dunkelmodus' }}
              </UButton>
              <UButton
                v-if="loggedIn"
                variant="ghost"
                block
                :class="mobileNavItemClass"
                aria-label="Abmelden"
                @click="logout"
              >
                <FontAwesomeIcon
                  icon="sign-out-alt"
                  class="size-5 shrink-0 opacity-70"
                />
                Abmelden
              </UButton>
              <UButton
                v-else
                :to="LOGIN_PATH"
                variant="ghost"
                block
                :class="mobileNavItemClass"
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
      </header>

      <main class="w-full max-w-6xl mx-auto px-4 py-6">
        <slot />
      </main>

      <footer class="border-t border-default bg-elevated/30">
        <div class="w-full max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted">
          <p>© {{ new Date().getFullYear() }} CHAPEL</p>
          <LegalFooterLinks />
        </div>
      </footer>

      <AuthChangePasswordModal v-if="user?.mustChangePassword" />
    </div>
  </UApp>
</template>
