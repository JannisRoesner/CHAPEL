<script setup lang="ts">
const toast = useToast()
const servicesStore = useServicesStore()
const elementTypes = useElementTypesStore()

/** leer = alle Vorlagen exportieren */
const selected = ref<number[]>([])
const importing = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

onMounted(() => {
  if (!servicesStore.serviceTypes.length) void servicesStore.fetchServiceTypes()
})

const exportHref = computed(() =>
  selected.value.length ? `/api/service-types/export?ids=${selected.value.join(',')}` : '/api/service-types/export'
)

function toggle(id: number) {
  selected.value = selected.value.includes(id) ? selected.value.filter(x => x !== id) : [...selected.value, id]
}

async function onFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  importing.value = true
  try {
    let data: unknown
    try {
      data = JSON.parse(await file.text())
    } catch {
      throw new Error('Die Datei ist kein gültiges JSON.')
    }
    const result = await $fetch<{ createdTemplates: Array<{ name: string }>, createdTypes: string[], unmatchedTracks: string[] }>(
      '/api/service-types/import',
      { method: 'POST', body: data as Record<string, unknown> }
    )
    await Promise.all([servicesStore.fetchServiceTypes(), elementTypes.fetchTypes()])

    const parts = [`${result.createdTemplates.length} Vorlage(n): ${result.createdTemplates.map(t => t.name).join(', ')}`]
    if (result.createdTypes.length) parts.push(`neue Elementtypen: ${result.createdTypes.join(', ')}`)
    toast.add({ title: 'Import abgeschlossen', description: parts.join(' · '), color: 'success' })
    if (result.unmatchedTracks.length) {
      toast.add({
        title: 'Einige Standard-Tracks fehlen in der Bibliothek',
        description: `Bitte in der Vorlage neu zuordnen: ${result.unmatchedTracks.join(', ')}`,
        color: 'warning',
        duration: 12000
      })
    }
  } catch (e) {
    const err = e as { data?: { message?: string, statusMessage?: string }, message?: string }
    toast.add({ title: 'Import fehlgeschlagen', description: err.data?.message || err.data?.statusMessage || err.message, color: 'error' })
  } finally {
    importing.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-3">
      <p class="font-semibold">
        Exportieren
      </p>
      <p class="text-sm text-muted">
        Speichert Vorlagen samt Schritten, Elementtypen und Verweisen auf die Standard-Tracks als <code>.json</code>-Datei.
        Audiodateien sind nicht enthalten. Ohne Auswahl werden alle Vorlagen exportiert.
      </p>
      <div
        v-if="servicesStore.serviceTypes.length"
        class="flex flex-wrap gap-2"
      >
        <button
          v-for="type in servicesStore.serviceTypes"
          :key="type.id"
          type="button"
          class="press min-h-10 rounded-full border px-4 text-sm font-medium"
          :class="selected.includes(type.id) ? 'border-primary bg-primary/10 text-primary' : 'border-default text-muted hover:bg-elevated/60'"
          :aria-pressed="selected.includes(type.id)"
          @click="toggle(type.id)"
        >
          {{ type.name }}
        </button>
      </div>
      <UButton
        :href="exportHref"
        external
        download
        icon="i-lucide-download"
        class="press min-h-11 w-full sm:w-auto justify-center"
        :disabled="!servicesStore.serviceTypes.length"
      >
        {{ selected.length ? `${selected.length} Vorlage(n) exportieren` : 'Alle Vorlagen exportieren' }}
      </UButton>
    </div>

    <div class="space-y-3 border-t border-default pt-5">
      <p class="font-semibold">
        Importieren
      </p>
      <p class="text-sm text-muted">
        Legt die Vorlagen aus der Datei neu an – vorhandene werden nicht überschrieben (bei gleichem Namen mit Zusatz „(Import)“).
        Fehlende Elementtypen werden ergänzt, Standard-Tracks über die Bibliothek zugeordnet.
      </p>
      <input
        ref="fileInput"
        type="file"
        accept="application/json,.json"
        class="hidden"
        @change="onFile"
      >
      <UButton
        variant="soft"
        icon="i-lucide-upload"
        class="press min-h-11 w-full sm:w-auto justify-center"
        :loading="importing"
        @click="fileInput?.click()"
      >
        JSON-Datei importieren
      </UButton>
    </div>
  </div>
</template>
