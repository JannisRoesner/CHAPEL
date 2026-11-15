<script setup lang="ts">
import { PLAYBACK_RATE_MAX, PLAYBACK_RATE_MIN, PLAYBACK_RATE_STEP } from '#shared/constants/audio'
import type { TrackDto } from '#shared/types/chapel'

/**
 * Nicht-destruktive Tempo-Anpassung: legt eine Variante an (oder ändert eine bestehende).
 * Die Audiodatei bleibt unverändert, das Tempo wird beim Abspielen tonhöhenerhaltend angewendet.
 */
const open = defineModel<boolean>('open', { default: false })
const props = defineProps<{ track: TrackDto | null }>()
const emit = defineEmits<{ saved: [track: TrackDto, created: boolean] }>()

const toast = useToast()
const libraryStore = useLibraryStore()
const rate = ref(1)
const title = ref('')
const titleTouched = ref(false)
const saving = ref(false)
const previewing = ref(false)
const audio = import.meta.client ? new Audio() : null

const isVariant = computed(() => !!props.track?.parentTrackId)
const parent = computed(() => {
  if (!props.track) return null
  return isVariant.value
    ? libraryStore.tracks.find(t => t.id === props.track!.parentTrackId) ?? null
    : props.track
})
const baseDurationMs = computed(() => {
  if (!props.track?.durationMs) return null
  return Math.round(props.track.durationMs * props.track.playbackRate)
})
const resultingDuration = computed(() => baseDurationMs.value ? Math.round(baseDurationMs.value / rate.value) : null)
const presets = [0.85, 0.9, 0.95, 1.05, 1.1, 1.15]
const unchanged = computed(() => Math.abs(rate.value - (isVariant.value ? props.track!.playbackRate : 1)) < 0.001)

function defaultTitle(r: number) {
  return `${parent.value?.title ?? props.track?.title ?? ''} (${formatPlaybackRate(r)})`
}

watch(open, (isOpen) => {
  if (isOpen && props.track) {
    rate.value = isVariant.value ? props.track.playbackRate : 0.95
    title.value = isVariant.value ? props.track.title : defaultTitle(rate.value)
    titleTouched.value = isVariant.value
  } else {
    stopPreview()
  }
})

watch(rate, (r) => {
  if (audio) audio.playbackRate = r
  if (!titleTouched.value) title.value = defaultTitle(r)
})

async function togglePreview() {
  if (!audio || !props.track) return
  if (previewing.value) return stopPreview()
  audio.src = `/api/tracks/${props.track.id}/stream`
  audio.preservesPitch = true
  audio.playbackRate = rate.value
  audio.onended = () => (previewing.value = false)
  try {
    await audio.play()
    audio.playbackRate = rate.value
    previewing.value = true
  } catch {
    previewing.value = false
  }
}

function stopPreview() {
  audio?.pause()
  previewing.value = false
}

onBeforeUnmount(stopPreview)

async function save() {
  if (!props.track || unchanged.value) return
  saving.value = true
  try {
    const body = { playbackRate: rate.value, title: title.value.trim() || undefined }
    const result = isVariant.value
      ? await $fetch<TrackDto>(`/api/tracks/${props.track.id}`, { method: 'PATCH', body })
      : await $fetch<TrackDto>(`/api/tracks/${props.track.id}/variants`, { method: 'POST', body })
    emit('saved', result, !isVariant.value)
    open.value = false
  } catch (error) {
    const e = error as { data?: { statusMessage?: string }, statusMessage?: string }
    toast.add({ title: 'Speichern fehlgeschlagen', description: e.data?.statusMessage || e.statusMessage, color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="isVariant ? 'Tempo-Variante bearbeiten' : 'Tempo anpassen'"
    description="Die Originaldatei bleibt unverändert – die Tonhöhe bleibt erhalten."
  >
    <template #body>
      <div
        v-if="track"
        class="space-y-6"
      >
        <div class="flex items-center gap-3 rounded-2xl bg-elevated/60 p-3">
          <UButton
            :variant="previewing ? 'solid' : 'soft'"
            square
            class="press size-12 shrink-0 justify-center rounded-full"
            :aria-label="previewing ? 'Probehören stoppen' : 'Probehören'"
            @click="togglePreview"
          >
            <FontAwesomeIcon
              :icon="previewing ? 'stop' : 'play'"
              class="text-lg"
            />
          </UButton>
          <div class="min-w-0">
            <p class="font-semibold truncate">
              {{ parent?.title ?? track.title }}
            </p>
            <p class="text-muted text-sm">
              {{ formatDuration(baseDurationMs) }} → {{ formatDuration(resultingDuration) }}
            </p>
          </div>
        </div>

        <div class="space-y-4">
          <div class="flex items-baseline justify-between">
            <span class="text-sm font-medium text-muted">Tempo</span>
            <span class="text-3xl font-semibold tabular-nums tracking-tight">{{ formatPlaybackRate(rate) }}</span>
          </div>
          <USlider
            v-model="rate"
            :min="PLAYBACK_RATE_MIN"
            :max="PLAYBACK_RATE_MAX"
            :step="PLAYBACK_RATE_STEP"
            size="xl"
            aria-label="Tempo"
            class="tempo-slider py-2"
          />
          <div class="flex justify-between text-xs text-dimmed tabular-nums">
            <span>{{ formatPlaybackRate(PLAYBACK_RATE_MIN) }}</span>
            <button
              type="button"
              class="press rounded-md px-2 hover:text-default"
              @click="rate = 1"
            >
              Original
            </button>
            <span>{{ formatPlaybackRate(PLAYBACK_RATE_MAX) }}</span>
          </div>
          <div class="grid grid-cols-6 gap-1.5">
            <button
              v-for="preset in presets"
              :key="preset"
              type="button"
              class="press min-h-11 rounded-xl border text-sm font-medium tabular-nums"
              :class="Math.abs(rate - preset) < 0.001 ? 'border-primary bg-primary/10 text-primary' : 'border-default text-muted hover:bg-elevated/60'"
              @click="rate = preset"
            >
              {{ Math.round(preset * 100) }}
            </button>
          </div>
        </div>

        <UFormField label="Name der Variante">
          <UInput
            v-model="title"
            size="lg"
            class="w-full"
            @input="titleTouched = true"
          />
        </UFormField>
      </div>
    </template>
    <template #footer="{ close }">
      <div class="flex flex-col-reverse sm:flex-row gap-2 w-full sm:justify-end">
        <UButton
          variant="ghost"
          color="neutral"
          class="min-h-11 justify-center"
          @click="close()"
        >
          Abbrechen
        </UButton>
        <UButton
          class="min-h-11 justify-center"
          :loading="saving"
          :disabled="unchanged"
          @click="save"
        >
          {{ isVariant ? 'Speichern' : 'Als Variante speichern' }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<style scoped>
.tempo-slider {
  touch-action: pan-y;
}
</style>
