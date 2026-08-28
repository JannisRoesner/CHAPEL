<script setup lang="ts">
import type { UserDto, UserRole } from '#shared/types/chapel'

const toast = useToast()

const users = ref<UserDto[]>([])
const loadingUsers = ref(false)
const creatingUser = ref(false)
const newUserName = ref('')
const newUserEmail = ref('')
const newUserPassword = ref('')
const newUserRole = ref<UserRole>('editor')

const resetUser = ref<UserDto | null>(null)
const resetPasswordOpen = ref(false)
const resetPassword = ref('')
const resetMustChange = ref(true)
const resettingPassword = ref(false)

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrator',
  editor: 'Benutzer'
}

onMounted(async () => {
  await fetchUsers()
})

async function fetchUsers() {
  loadingUsers.value = true
  try {
    users.value = await $fetch<UserDto[]>('/api/users')
  } finally {
    loadingUsers.value = false
  }
}

async function createUser() {
  creatingUser.value = true
  try {
    const created = await $fetch<UserDto>('/api/users', {
      method: 'POST',
      body: {
        name: newUserName.value,
        email: newUserEmail.value,
        password: newUserPassword.value,
        role: newUserRole.value
      }
    })
    users.value = [...users.value, created]
    newUserName.value = ''
    newUserEmail.value = ''
    newUserPassword.value = ''
    newUserRole.value = 'editor'
    toast.add({ title: 'Benutzer angelegt', color: 'success' })
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }, statusMessage?: string }
    toast.add({
      title: 'Benutzer konnte nicht angelegt werden',
      description: err.data?.message || err.statusMessage,
      color: 'error'
    })
  } finally {
    creatingUser.value = false
  }
}

function openResetPassword(entry: UserDto) {
  resetUser.value = entry
  resetPassword.value = ''
  resetMustChange.value = true
  resetPasswordOpen.value = true
}

function closeResetPassword() {
  resetPasswordOpen.value = false
}

async function submitResetPassword() {
  if (!resetUser.value) return
  resettingPassword.value = true
  try {
    const updated = await $fetch<UserDto>(`/api/users/${resetUser.value.id}/password`, {
      method: 'PATCH',
      body: {
        password: resetPassword.value,
        mustChangePassword: resetMustChange.value
      }
    })
    users.value = users.value.map(entry => entry.id === updated.id ? updated : entry)
    resetPasswordOpen.value = false
    toast.add({ title: 'Passwort zurückgesetzt', color: 'success' })
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }, statusMessage?: string }
    toast.add({
      title: 'Passwort konnte nicht zurückgesetzt werden',
      description: err.data?.message || err.statusMessage,
      color: 'error'
    })
  } finally {
    resettingPassword.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <p class="text-sm text-muted">
      Neue Benutzer können sich anmelden und auf Gottesdienste, Bibliothek und Wiedergabe zugreifen.
    </p>

    <div
      v-if="loadingUsers"
      class="text-sm text-muted"
    >
      Benutzer werden geladen…
    </div>

    <div
      v-else-if="users.length"
      class="space-y-3"
    >
      <div
        v-for="entry in users"
        :key="entry.id"
        class="rounded-2xl border border-default p-4 sm:p-5"
      >
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="min-w-0">
            <p class="font-semibold truncate">
              {{ entry.name }}
            </p>
            <p class="text-muted truncate mt-0.5">
              {{ entry.email }}
            </p>
            <div class="flex flex-wrap gap-2 mt-2">
              <UBadge
                v-if="entry.mustChangePassword"
                color="warning"
                variant="subtle"
              >
                Passwort ändern
              </UBadge>
              <UBadge variant="subtle">
                {{ roleLabels[entry.role] }}
              </UBadge>
            </div>
          </div>
          <UButton
            variant="outline"
            class="min-h-12 justify-center w-full sm:w-auto"
            @click="openResetPassword(entry)"
          >
            Passwort zurücksetzen
          </UButton>
        </div>
      </div>
    </div>

    <UEmpty
      v-else
      title="Keine Benutzer"
      description="Legen Sie den ersten Benutzer an."
    />

    <form
      class="grid gap-4 md:grid-cols-2 border-t border-default pt-6"
      @submit.prevent="createUser"
    >
      <UFormField
        label="Name"
        class="md:col-span-2"
      >
        <UInput
          v-model="newUserName"
          placeholder="z.B. Max Mustermann"
          required
        />
      </UFormField>
      <UFormField label="E-Mail">
        <UInput
          v-model="newUserEmail"
          type="email"
          autocomplete="off"
          required
        />
      </UFormField>
      <UFormField label="Passwort">
        <UInput
          v-model="newUserPassword"
          type="password"
          autocomplete="new-password"
          minlength="8"
          required
        />
      </UFormField>
      <UFormField
        label="Rolle"
        class="md:col-span-2"
      >
        <USelect
          v-model="newUserRole"
          :items="[
            { label: 'Benutzer', value: 'editor' },
            { label: 'Administrator', value: 'admin' }
          ]"
        />
      </UFormField>
      <div class="md:col-span-2">
        <UButton
          type="submit"
          class="min-h-12"
          :loading="creatingUser"
        >
          Benutzer anlegen
        </UButton>
      </div>
    </form>

    <UModal v-model:open="resetPasswordOpen">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="font-semibold">
              Passwort zurücksetzen
            </h3>
            <p
              v-if="resetUser"
              class="text-sm text-muted mt-1"
            >
              {{ resetUser.name }} ({{ resetUser.email }})
            </p>
          </template>

          <div class="space-y-4">
            <UFormField label="Neues Passwort">
              <UInput
                v-model="resetPassword"
                type="password"
                autocomplete="new-password"
                minlength="8"
                required
              />
            </UFormField>
            <UCheckbox
              v-model="resetMustChange"
              label="Beim nächsten Login ändern erzwingen"
            />
          </div>

          <template #footer>
            <div class="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
              <UButton
                variant="ghost"
                color="neutral"
                class="min-h-11 justify-center"
                @click="closeResetPassword"
              >
                Abbrechen
              </UButton>
              <UButton
                class="min-h-11 justify-center"
                :loading="resettingPassword"
                @click="submitResetPassword"
              >
                Passwort speichern
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
