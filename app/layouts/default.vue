<script setup lang="ts">
import { APP_NAV_ITEMS, DEFAULT_ROUTE } from '#shared/constants/app'

const colorMode = useColorMode()
const route = useRoute()
const mobileMenuOpen = ref(false)
const { user } = useUserSession()

useHead({
  htmlAttrs: {
    lang: 'de'
  }
})

watch(() => route.path, () => {
  mobileMenuOpen.value = false
})

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await navigateTo('/login')
}

function openMobileMenu() {
  mobileMenuOpen.value = true
}
</script>

<template>
  <UApp :class="colorMode.value">
    <div class="min-h-screen bg-default text-default">
      <header class="border-b border-default bg-elevated/80 backdrop-blur sticky top-0 z-50">
        <div class="max-w-6xl mx-auto px-4 min-h-14 py-2 flex items-center justify-between gap-4">
          <NuxtLink
            :to="DEFAULT_ROUTE"
            class="shrink-0 min-w-0"
          >
            <UiAppLogo />
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

          <div class="flex items-center gap-2 shrink-0">
            <UButton
              class="md:hidden"
              variant="ghost"
              size="sm"
              aria-label="Menü öffnen"
              @click="openMobileMenu"
            >
              <FontAwesomeIcon icon="bars" />
            </UButton>
            <UiThemeToggle />
            <UButton
              variant="ghost"
              size="sm"
              @click="logout"
            >
              <FontAwesomeIcon icon="sign-out-alt" />
            </UButton>
          </div>
        </div>
      </header>

      <USlideover
        v-model:open="mobileMenuOpen"
        title="Menü"
      >
        <template #body>
          <nav class="flex flex-col gap-1">
            <UButton
              v-for="item in APP_NAV_ITEMS"
              :key="item.to"
              :to="item.to"
              variant="ghost"
              block
              class="justify-start gap-3"
              :color="item.primary ? 'primary' : undefined"
            >
              <FontAwesomeIcon
                :icon="item.icon"
                class="size-4 shrink-0 opacity-70"
              />
              {{ item.label }}
            </UButton>
          </nav>
        </template>
      </USlideover>

      <main class="max-w-6xl mx-auto px-4 py-6">
        <slot />
      </main>

      <AuthChangePasswordModal v-if="user?.mustChangePassword" />
    </div>
  </UApp>
</template>
