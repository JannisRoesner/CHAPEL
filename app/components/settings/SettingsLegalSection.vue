<script setup lang="ts">
import { LEGAL_ROUTES } from '#shared/constants/legal'

const toast = useToast()

const impressum = ref('')
const privacy = ref('')
const loading = ref(true)
const savingImpressum = ref(false)
const savingPrivacy = ref(false)

async function loadLegal() {
  loading.value = true
  try {
    const data = await $fetch<{ impressum: string, privacy: string }>('/api/legal')
    impressum.value = data.impressum
    privacy.value = data.privacy
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }, statusMessage?: string }
    toast.add({
      title: 'Rechtliche Inhalte konnten nicht geladen werden',
      description: err.data?.message || err.statusMessage,
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

async function saveImpressum() {
  savingImpressum.value = true
  try {
    await $fetch('/api/legal', {
      method: 'PATCH',
      body: { impressum: impressum.value }
    })
    toast.add({ title: 'Impressum gespeichert', color: 'success' })
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }, statusMessage?: string }
    toast.add({
      title: 'Impressum konnte nicht gespeichert werden',
      description: err.data?.message || err.statusMessage,
      color: 'error'
    })
  } finally {
    savingImpressum.value = false
  }
}

async function savePrivacy() {
  savingPrivacy.value = true
  try {
    await $fetch('/api/legal', {
      method: 'PATCH',
      body: { privacy: privacy.value }
    })
    toast.add({ title: 'Datenschutzerklärung gespeichert', color: 'success' })
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }, statusMessage?: string }
    toast.add({
      title: 'Datenschutzerklärung konnte nicht gespeichert werden',
      description: err.data?.message || err.statusMessage,
      color: 'error'
    })
  } finally {
    savingPrivacy.value = false
  }
}

onMounted(loadLegal)
</script>

<template>
  <div class="space-y-6">
    <p class="text-sm text-muted">
      Impressum und Datenschutzerklärung als Markdown pflegen. Die Seiten sind öffentlich unter
      <NuxtLink
        :to="LEGAL_ROUTES.impressum"
        class="text-primary hover:underline"
        target="_blank"
      >
        {{ LEGAL_ROUTES.impressum }}
      </NuxtLink>
      und
      <NuxtLink
        :to="LEGAL_ROUTES.privacy"
        class="text-primary hover:underline"
        target="_blank"
      >
        {{ LEGAL_ROUTES.privacy }}
      </NuxtLink>
      erreichbar.
    </p>

    <div
      v-if="loading"
      class="text-sm text-muted"
    >
      Lade Inhalte …
    </div>

    <template v-else>
      <div class="space-y-3">
        <div class="flex items-center justify-between gap-4">
          <h3 class="text-sm font-medium">
            Impressum
          </h3>
          <UButton
            size="sm"
            :loading="savingImpressum"
            :disabled="savingImpressum || savingPrivacy"
            @click="saveImpressum"
          >
            Speichern
          </UButton>
        </div>
        <UiMarkdownEditor
          v-model="impressum"
          placeholder="Markdown für das Impressum eingeben …"
        />
      </div>

      <div class="space-y-3">
        <div class="flex items-center justify-between gap-4">
          <h3 class="text-sm font-medium">
            Datenschutzerklärung
          </h3>
          <UButton
            size="sm"
            :loading="savingPrivacy"
            :disabled="savingImpressum || savingPrivacy"
            @click="savePrivacy"
          >
            Speichern
          </UButton>
        </div>
        <UiMarkdownEditor
          v-model="privacy"
          placeholder="Markdown für die Datenschutzerklärung eingeben …"
        />
      </div>
    </template>
  </div>
</template>
