<script setup lang="ts">
import type { UserDto, UserRole } from '#shared/types/chapel'
import { COLOR_SCHEMES } from '#shared/constants/colorSchemes'
import type { ColorSchemeId } from '#shared/constants/colorSchemes'

const offlineCache = useOfflineCache()
const { cachedServiceIds } = offlineCache
const toast = useToast()
const { user } = useUserSession()
const { branding, fetchBranding } = useBranding()
const { colorScheme, appearanceMode, colorMode, savePreferences } = useAppearance()

const cacheSize = ref('…')
const users = ref<UserDto[]>([])
const loadingUsers = ref(false)
const creatingUser = ref(false)
const newUserName = ref('')
const newUserEmail = ref('')
const newUserPassword = ref('')
const newUserRole = ref<UserRole>('editor')

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const changingPassword = ref(false)

const resetUser = ref<UserDto | null>(null)
const resetPasswordOpen = ref(false)
const resetPassword = ref('')
const resetMustChange = ref(true)
const resettingPassword = ref(false)

const uploadingLogo = ref(false)
const removingLogo = ref(false)
const logoDragOver = ref(false)
const savingAppearance = ref(false)

const isAdmin = computed(() => user.value?.role === 'admin')

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrator',
  editor: 'Benutzer'
}

const appearanceItems = [
  { label: 'System', value: 'system' },
  { label: 'Hell', value: 'light' },
  { label: 'Dunkel', value: 'dark' }
]

onMounted(async () => {
  cacheSize.value = await offlineCache.getCacheSizeEstimate()
  if (isAdmin.value) {
    await fetchUsers()
  }
})

watch(() => colorMode.preference, async (value) => {
  if (!user.value || savingAppearance.value) return
  if (value === appearanceMode.value) return
  await updateAppearanceMode(value as 'system' | 'light' | 'dark')
})

async function updateAppearanceMode(mode: 'system' | 'light' | 'dark') {
  savingAppearance.value = true
  try {
    await savePreferences({ appearanceMode: mode })
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }, statusMessage?: string }
    toast.add({
      title: 'Darstellung konnte nicht gespeichert werden',
      description: err.data?.message || err.statusMessage,
      color: 'error'
    })
  } finally {
    savingAppearance.value = false
  }
}

async function selectColorScheme(schemeId: ColorSchemeId) {
  if (schemeId === colorScheme.value) return
  savingAppearance.value = true
  try {
    await savePreferences({ colorScheme: schemeId })
    toast.add({ title: 'Farbschema gespeichert', color: 'success' })
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }, statusMessage?: string }
    toast.add({
      title: 'Farbschema konnte nicht gespeichert werden',
      description: err.data?.message || err.statusMessage,
      color: 'error'
    })
  } finally {
    savingAppearance.value = false
  }
}

async function uploadLogo(files: FileList | File[]) {
  const file = Array.from(files)[0]
  if (!file) return

  uploadingLogo.value = true
  try {
    const form = new FormData()
    form.append('file', file)
    await $fetch('/api/settings/logo', { method: 'POST', body: form })
    await fetchBranding()
    toast.add({ title: 'Logo gespeichert', color: 'success' })
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }, statusMessage?: string }
    toast.add({
      title: 'Logo konnte nicht hochgeladen werden',
      description: err.data?.message || err.statusMessage,
      color: 'error'
    })
  } finally {
    uploadingLogo.value = false
  }
}

function onLogoFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files?.length) uploadLogo(input.files)
  input.value = ''
}

function onLogoDrop(event: DragEvent) {
  logoDragOver.value = false
  if (event.dataTransfer?.files?.length) {
    uploadLogo(event.dataTransfer.files)
  }
}

async function resetLogo() {
  if (!confirm('Standard-Logo wiederherstellen?')) return
  removingLogo.value = true
  try {
    await $fetch('/api/settings/logo', { method: 'DELETE' })
    await fetchBranding()
    toast.add({ title: 'Standard-Logo wiederhergestellt', color: 'success' })
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }, statusMessage?: string }
    toast.add({
      title: 'Logo konnte nicht zurückgesetzt werden',
      description: err.data?.message || err.statusMessage,
      color: 'error'
    })
  } finally {
    removingLogo.value = false
  }
}

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
          Branding
        </h2>
      </template>

      <div class="space-y-4">
        <p class="text-sm text-muted">
          Eigenes Logo für alle Benutzer als Navigations-Icon und Favicon. Empfohlen: quadratisches PNG oder SVG (max. 2 MB).
        </p>

        <div class="flex items-center gap-4">
          <img
            :src="branding.logoUrl"
            alt="Aktuelles Logo"
            class="h-16 w-16 rounded-lg object-contain bg-elevated border border-default"
          >
          <div class="text-sm text-muted">
            {{ branding.hasCustomLogo ? 'Benutzerdefiniertes Logo aktiv' : 'Standard-Kirchen-Icon aktiv' }}
          </div>
        </div>

        <div
          class="border-2 border-dashed rounded-lg p-6 text-center transition-colors"
          :class="logoDragOver ? 'border-primary bg-primary/5' : 'border-default'"
          @dragover.prevent="logoDragOver = true"
          @dragleave="logoDragOver = false"
          @drop.prevent="onLogoDrop"
        >
          <FontAwesomeIcon
            icon="upload"
            class="text-2xl text-muted mb-2"
          />
          <p class="text-sm text-muted mb-4">
            Logo hier ablegen oder auswählen (PNG, JPEG, WebP, SVG)
          </p>
          <div class="flex flex-wrap items-center justify-center gap-3">
            <label>
              <UButton
                as="span"
                :loading="uploadingLogo"
                :disabled="uploadingLogo || removingLogo"
              >
                Logo hochladen
              </UButton>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml,.png,.jpg,.jpeg,.webp,.svg"
                class="hidden"
                @change="onLogoFileChange"
              >
            </label>
            <UButton
              v-if="branding.hasCustomLogo"
              variant="outline"
              color="error"
              :loading="removingLogo"
              :disabled="uploadingLogo || removingLogo"
              @click="resetLogo"
            >
              Standard wiederherstellen
            </UButton>
          </div>
        </div>
      </div>
    </UCard>

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
              <div class="flex items-center gap-2 shrink-0">
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
                <UButton
                  variant="outline"
                  size="sm"
                  @click="openResetPassword(entry)"
                >
                  Passwort zurücksetzen
                </UButton>
              </div>
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

    <UCard v-if="!user?.mustChangePassword">
      <template #header>
        <h2 class="font-medium">
          Passwort ändern
        </h2>
      </template>
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
    </UCard>

    <UCard>
      <template #header>
        <h2 class="font-medium">
          Darstellung
        </h2>
      </template>

      <div class="space-y-6">
        <UFormField label="Modus">
          <USelect
            v-model="colorMode.preference"
            :items="appearanceItems"
            :disabled="savingAppearance"
          />
        </UFormField>

        <div>
          <p class="text-sm font-medium mb-3">
            Farbschema
          </p>
          <div class="grid gap-3 sm:grid-cols-2">
            <button
              v-for="scheme in COLOR_SCHEMES"
              :key="scheme.id"
              type="button"
              class="rounded-lg border p-4 text-left transition-colors"
              :class="colorScheme === scheme.id
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'border-default hover:bg-elevated/50'"
              :disabled="savingAppearance"
              @click="selectColorScheme(scheme.id)"
            >
              <div class="flex items-center gap-3 mb-2">
                <span
                  v-for="(color, index) in scheme.preview"
                  :key="index"
                  class="h-6 w-6 rounded-full border border-default"
                  :style="{ backgroundColor: color }"
                />
              </div>
              <p class="font-medium">
                {{ scheme.name }}
              </p>
              <p class="text-sm text-muted mt-1">
                {{ scheme.description }}
              </p>
            </button>
          </div>
        </div>
      </div>
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

    <UModal
      v-model:open="resetPasswordOpen"
    >
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
            <div class="flex justify-end gap-2">
              <UButton
                variant="ghost"
                @click="closeResetPassword"
              >
                Abbrechen
              </UButton>
              <UButton
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
