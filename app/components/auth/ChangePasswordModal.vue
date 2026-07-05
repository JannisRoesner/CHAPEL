<script setup lang="ts">
const newPassword = ref('')
const confirmPassword = ref('')
const error = ref('')
const saving = ref(false)

const toast = useToast()
const { fetch: fetchSession } = useUserSession()

async function save() {
  error.value = ''
  saving.value = true
  try {
    await $fetch('/api/auth/change-password', {
      method: 'POST',
      body: {
        newPassword: newPassword.value,
        confirmPassword: confirmPassword.value
      }
    })
    await fetchSession()
    newPassword.value = ''
    confirmPassword.value = ''
    toast.add({ title: 'Passwort gespeichert', color: 'success' })
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }, statusMessage?: string }
    error.value = err.data?.message || err.statusMessage || 'Passwort konnte nicht gespeichert werden'
  } finally {
    saving.value = false
  }
}

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await navigateTo('/login')
}
</script>

<template>
  <UModal
    :open="true"
    :dismissible="false"
  >
    <template #content>
      <UCard>
        <template #header>
          <h3 class="font-semibold">
            Passwort festlegen
          </h3>
          <p class="text-sm text-muted mt-1">
            Bitte legen Sie ein neues Passwort fest, bevor Sie fortfahren.
          </p>
        </template>

        <form
          class="space-y-4"
          @submit.prevent="save"
        >
          <UFormField label="Neues Passwort">
            <UInput
              v-model="newPassword"
              type="password"
              autocomplete="new-password"
              minlength="8"
              required
            />
          </UFormField>
          <UFormField label="Passwort bestätigen">
            <UInput
              v-model="confirmPassword"
              type="password"
              autocomplete="new-password"
              minlength="8"
              required
            />
          </UFormField>
          <UAlert
            v-if="error"
            color="error"
            variant="subtle"
            :title="error"
          />
          <div class="flex justify-end gap-2">
            <UButton
              variant="ghost"
              type="button"
              @click="logout"
            >
              Abmelden
            </UButton>
            <UButton
              type="submit"
              :loading="saving"
            >
              Passwort speichern
            </UButton>
          </div>
        </form>
      </UCard>
    </template>
  </UModal>
</template>
