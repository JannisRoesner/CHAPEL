<script setup lang="ts">
const toast = useToast()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const changingPassword = ref(false)

async function changePassword() {
  changingPassword.value = true
  try {
    await $fetch('/api/auth/change-password', {
      method: 'POST',
      body: {
        currentPassword: currentPassword.value,
        newPassword: newPassword.value,
        confirmPassword: confirmPassword.value
      }
    })
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    toast.add({ title: 'Passwort geändert', color: 'success' })
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }, statusMessage?: string }
    toast.add({
      title: 'Passwort konnte nicht geändert werden',
      description: err.data?.message || err.statusMessage,
      color: 'error'
    })
  } finally {
    changingPassword.value = false
  }
}
</script>

<template>
  <form
    class="grid gap-4 md:grid-cols-2"
    @submit.prevent="changePassword"
  >
    <UFormField
      label="Aktuelles Passwort"
      class="md:col-span-2"
    >
      <UInput
        v-model="currentPassword"
        type="password"
        autocomplete="current-password"
        required
      />
    </UFormField>
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
    <div class="md:col-span-2">
      <UButton
        type="submit"
        :loading="changingPassword"
      >
        Passwort speichern
      </UButton>
    </div>
  </form>
</template>
