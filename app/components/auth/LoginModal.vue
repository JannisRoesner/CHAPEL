<script setup lang="ts">
import { DEFAULT_ROUTE } from '#shared/constants/app'

const open = defineModel<boolean>('open', { default: false })

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const { user, fetch: fetchSession } = useUserSession()
const { saveLocalSession } = useLocalSession()

async function login() {
  error.value = ''
  loading.value = true
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email: email.value, password: password.value }
    })
    await fetchSession()
    if (user.value) {
      saveLocalSession(user.value)
    }
    open.value = false
    await navigateTo(DEFAULT_ROUTE)
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }, statusMessage?: string }
    error.value = err.data?.message || err.statusMessage || 'Anmeldung fehlgeschlagen'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UModal v-model:open="open">
    <template #content>
      <UCard>
        <template #header>
          <UiAppLogo size="lg" />
        </template>

        <form
          class="space-y-4"
          @submit.prevent="login"
        >
          <UFormField label="E-Mail">
            <UInput
              v-model="email"
              class="w-full"
              size="lg"
              type="email"
              autocomplete="username"
              required
            />
          </UFormField>
          <UFormField label="Passwort">
            <UInput
              v-model="password"
              class="w-full"
              size="lg"
              type="password"
              autocomplete="current-password"
              required
            />
          </UFormField>
          <UAlert
            v-if="error"
            color="error"
            variant="subtle"
            :title="error"
          />
          <UButton
            type="submit"
            block
            size="xl"
            class="min-h-12"
            :loading="loading"
          >
            Anmelden
          </UButton>
        </form>
      </UCard>
    </template>
  </UModal>
</template>
