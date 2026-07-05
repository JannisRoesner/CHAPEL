<script setup lang="ts">
import type { UserDto, UserRole } from '#shared/types/chapel'

const colorMode = useColorMode()
const offlineCache = useOfflineCache()
const { cachedServiceIds } = offlineCache
const toast = useToast()
const { user } = useUserSession()

const cacheSize = ref('…')
const users = ref<UserDto[]>([])
const loadingUsers = ref(false)
const creatingUser = ref(false)
const newUserName = ref('')
const newUserEmail = ref('')
const newUserPassword = ref('')
const newUserRole = ref<UserRole>('editor')

const isAdmin = computed(() => user.value?.role === 'admin')

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrator',
  editor: 'Benutzer'
}

onMounted(async () => {
  cacheSize.value = await offlineCache.getCacheSizeEstimate()
  if (isAdmin.value) {
    await fetchUsers()
  }
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

async function clearCache() {
  if (!confirm('Offline-Cache wirklich leeren?')) return
  await offlineCache.clearCache()
  cacheSize.value = await offlineCache.getCacheSizeEstimate()
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-semibold mb-1">
        Einstellungen
      </h1>
      <p class="text-muted">
        Darstellung, Benutzer und Offline-Speicher
      </p>
    </div>

    <UCard v-if="isAdmin">
      <template #header>
        <h2 class="font-medium">
          Benutzerverwaltung
        </h2>
      </template>

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
          class="space-y-2"
        >
          <UCard
            v-for="entry in users"
            :key="entry.id"
          >
            <div class="flex items-center justify-between gap-4">
              <div class="min-w-0">
                <p class="font-medium truncate">
                  {{ entry.name }}
                </p>
                <p class="text-sm text-muted truncate">
                  {{ entry.email }}
                </p>
              </div>
              <UBadge variant="subtle">
                {{ roleLabels[entry.role] }}
              </UBadge>
            </div>
          </UCard>
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
              :loading="creatingUser"
            >
              Benutzer anlegen
            </UButton>
          </div>
        </form>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <h2 class="font-medium">
          Darstellung
        </h2>
      </template>
      <UFormField label="Farbschema">
        <USelect
          v-model="colorMode.preference"
          :items="[
            { label: 'System', value: 'system' },
            { label: 'Hell', value: 'light' },
            { label: 'Dunkel', value: 'dark' }
          ]"
        />
      </UFormField>
    </UCard>

    <UCard>
      <template #header>
        <h2 class="font-medium">
          Offline-Cache
        </h2>
      </template>
      <div class="space-y-4">
        <p class="text-sm text-muted">
          Geschätzte Nutzung: {{ cacheSize }}
        </p>
        <p class="text-sm text-muted">
          {{ cachedServiceIds.length }} Gottesdienst(e) offline vorbereitet
        </p>
        <UButton
          color="error"
          variant="outline"
          @click="clearCache"
        >
          <FontAwesomeIcon
            icon="trash"
            class="mr-2"
          />
          Cache leeren
        </UButton>
      </div>
    </UCard>
  </div>
</template>
