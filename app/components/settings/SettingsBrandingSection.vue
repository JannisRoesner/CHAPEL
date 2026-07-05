<script setup lang="ts">
const toast = useToast()
const { branding, fetchBranding } = useBranding()

const uploadingLogo = ref(false)
const removingLogo = ref(false)
const logoDragOver = ref(false)

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
</script>

<template>
  <div class="space-y-4">
    <p class="text-sm text-muted">
      Eigenes Logo für alle Benutzer als Navigations-Icon und Favicon. Empfohlen: quadratisches PNG oder SVG (max. 2 MB).
    </p>

    <div class="flex items-center gap-4">
      <img
        v-if="branding.hasCustomLogo"
        :src="branding.logoUrl"
        alt="Aktuelles Logo"
        class="h-16 w-16 rounded-lg object-contain bg-elevated border border-default"
      >
      <UiChapelIcon
        v-else
        size="xl"
      />
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
</template>
