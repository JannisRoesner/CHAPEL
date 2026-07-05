<script setup lang="ts">
import { AUDIO_FILE_ACCEPT } from '#shared/constants/audio'
import type { TrackDto } from '#shared/types/chapel'

const emit = defineEmits<{
  uploaded: [track: TrackDto]
  duplicate: [existing: TrackDto]
}>()

const category = ref<'hymn' | 'liturgy'>('hymn')
const uploading = ref(false)
const dragOver = ref(false)
const error = ref('')

async function uploadFiles(files: FileList | File[]) {
  error.value = ''
  uploading.value = true

  try {
    for (const file of Array.from(files)) {
      const form = new FormData()
      form.append('file', file)
      form.append('category', category.value)

      try {
        const track = await $fetch<TrackDto>('/api/tracks/upload', {
          method: 'POST',
          body: form
        })
        emit('uploaded', track)
      } catch (e: unknown) {
        const err = e as {
          statusCode?: number
          data?: { existingTrack?: TrackDto, message?: string }
          statusMessage?: string
        }
        if (err.statusCode === 409 && err.data?.existingTrack) {
          emit('duplicate', err.data.existingTrack)
        } else {
          error.value = err.data?.message || err.statusMessage || 'Upload fehlgeschlagen'
        }
      }
    }
  } finally {
    uploading.value = false
  }
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files?.length) uploadFiles(input.files)
  input.value = ''
}

function onDrop(event: DragEvent) {
  dragOver.value = false
  if (event.dataTransfer?.files?.length) {
    uploadFiles(event.dataTransfer.files)
  }
}
</script>

<template>
  <UCard>
    <div
      class="border-2 border-dashed rounded-lg p-8 text-center transition-colors"
      :class="dragOver ? 'border-primary bg-primary/5' : 'border-default'"
      @dragover.prevent="dragOver = true"
      @dragleave="dragOver = false"
      @drop.prevent="onDrop"
    >
      <FontAwesomeIcon
        icon="upload"
        class="text-3xl text-muted mb-3"
      />
      <p class="mb-4 text-muted">
        Audiodateien (MP3, WAV, FLAC, OGG) hier ablegen oder auswählen
      </p>

      <div class="flex flex-wrap items-center justify-center gap-3 mb-4">
        <USelect
          v-model="category"
          :items="[
            { label: 'Lied', value: 'hymn' },
            { label: 'Liturgie', value: 'liturgy' }
          ]"
          class="w-40"
        />
        <label>
          <UButton
            as="span"
            :loading="uploading"
            :disabled="uploading"
          >
            Dateien wählen
          </UButton>
          <input
            type="file"
            :accept="AUDIO_FILE_ACCEPT"
            multiple
            class="hidden"
            @change="onFileChange"
          >
        </label>
      </div>

      <UAlert
        v-if="error"
        color="error"
        variant="subtle"
        :title="error"
        class="mt-4"
      />
    </div>
  </UCard>
</template>
