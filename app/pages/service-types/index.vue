<script setup lang="ts">
const servicesStore = useServicesStore()
const toast = useToast()
const creating = ref(false)
const newName = ref('')

onMounted(() => servicesStore.fetchServiceTypes())

async function createType() {
  const name = newName.value.trim()
  if (!name) return
  creating.value = true
  try {
    const type = await $fetch('/api/service-types', {
      method: 'POST',
      body: { name }
    })
    servicesStore.upsertServiceType(type)
    newName.value = ''
    toast.add({ title: 'Typ erstellt', color: 'success' })
    await navigateTo(`/service-types/${type.id}`)
  } finally {
    creating.value = false
  }
}

async function deleteType(id: number, name: string) {
  if (!confirm(`"${name}" wirklich löschen?`)) return
  await $fetch(`/api/service-types/${id}`, { method: 'DELETE' })
  servicesStore.removeServiceType(id)
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-semibold mb-1">
        Gottesdienst-Typen
      </h1>
      <p class="text-muted">
        Vorlagen mit festen Liturgieelementen und Lied-Slots anlegen
      </p>
    </div>

    <UCard>
      <form
        class="flex gap-3"
        @submit.prevent="createType"
      >
        <UInput
          v-model="newName"
          placeholder="Neuer Typ, z.B. Sonntagsgottesdienst"
          class="flex-1"
        />
        <UButton
          type="submit"
          :loading="creating"
        >
          Anlegen
        </UButton>
      </form>
    </UCard>

    <div
      v-if="servicesStore.serviceTypes.length"
      class="space-y-2"
    >
      <UCard
        v-for="type in servicesStore.serviceTypes"
        :key="type.id"
        class="hover:bg-elevated/30 transition-colors"
      >
        <div class="flex items-center justify-between gap-4">
          <NuxtLink
            :to="`/service-types/${type.id}`"
            class="flex-1 min-w-0"
          >
            <p class="font-medium">{{ type.name }}</p>
            <p
              v-if="type.description"
              class="text-sm text-muted truncate"
            >{{ type.description }}</p>
          </NuxtLink>
          <div class="flex gap-2 shrink-0">
            <UButton
              :to="`/service-types/${type.id}`"
              variant="ghost"
              size="sm"
            >
              Bearbeiten
            </UButton>
            <UButton
              variant="ghost"
              size="sm"
              color="error"
              @click="deleteType(type.id, type.name)"
            >
              <FontAwesomeIcon icon="trash" />
            </UButton>
          </div>
        </div>
      </UCard>
    </div>

    <UEmpty
      v-else
      title="Keine Typen"
      description="Erstellen Sie eine Vorlage für Ihren Gottesdienstablauf."
    />
  </div>
</template>
