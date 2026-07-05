<script setup lang="ts">
import type { ServiceDto, ServiceTypeDto } from '#shared/types/chapel'

const servicesStore = useServicesStore()
const toast = useToast()
const creating = ref(false)
const selectedTypeId = ref<number | undefined>(undefined)
const serviceName = ref('')
const serviceDate = ref(new Date().toISOString().slice(0, 10))

onMounted(async () => {
  await Promise.all([servicesStore.fetchServices(), servicesStore.fetchServiceTypes()])
  if (servicesStore.serviceTypes.length) {
    selectedTypeId.value = servicesStore.serviceTypes[0]!.id
  }
})

async function createService() {
  if (!selectedTypeId.value) return
  creating.value = true
  try {
    const service = await $fetch<ServiceDto>(`/api/services/from-type/${selectedTypeId.value}`, {
      method: 'POST',
      body: {
        name: serviceName.value.trim() || undefined,
        serviceDate: new Date(serviceDate.value).toISOString()
      }
    })
    servicesStore.upsertService(service)
    toast.add({ title: 'Gottesdienst erstellt', color: 'success' })
    serviceName.value = ''
    await navigateTo(`/services/${service.id}`)
  } finally {
    creating.value = false
  }
}

async function deleteService(id: number, name: string) {
  if (!confirm(`"${name}" wirklich löschen?`)) return
  await $fetch(`/api/services/${id}`, { method: 'DELETE' })
  servicesStore.removeService(id)
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-semibold mb-1">
        Gottesdienste
      </h1>
      <p class="text-muted">
        Gottesdienste aus Vorlagen erstellen
      </p>
    </div>

    <UCard>
      <form
        class="grid gap-4 md:grid-cols-2"
        @submit.prevent="createService"
      >
        <UFormField label="Vorlage">
          <USelect
            v-model="selectedTypeId"
            :items="servicesStore.serviceTypes.map((t: ServiceTypeDto) => ({ label: t.name, value: t.id }))"
          />
        </UFormField>
        <UFormField label="Datum">
          <UInput
            v-model="serviceDate"
            type="date"
          />
        </UFormField>
        <UFormField
          label="Name (optional)"
          class="md:col-span-2"
        >
          <UInput
            v-model="serviceName"
            placeholder="z.B. 1. Advent"
          />
        </UFormField>
        <div class="md:col-span-2">
          <UButton
            type="submit"
            :loading="creating"
            :disabled="!selectedTypeId"
          >
            Gottesdienst anlegen
          </UButton>
        </div>
      </form>
    </UCard>

    <div
      v-if="servicesStore.services.length"
      class="space-y-2"
    >
      <UCard
        v-for="service in servicesStore.services"
        :key="service.id"
      >
        <div class="flex items-center justify-between gap-4">
          <div class="min-w-0">
            <p class="font-medium truncate">
              {{ service.name }}
            </p>
            <p class="text-sm text-muted">
              {{ formatServiceDate(service.serviceDate) }}
            </p>
          </div>
          <div class="flex gap-2 shrink-0">
            <UButton
              :to="`/services/${service.id}`"
              variant="ghost"
              size="sm"
            >
              Bearbeiten
            </UButton>
            <UButton
              :to="`/playback/${service.id}`"
              color="primary"
              size="sm"
            >
              Abspielen
            </UButton>
            <UButton
              variant="ghost"
              size="sm"
              color="error"
              @click="deleteService(service.id, service.name)"
            >
              <FontAwesomeIcon icon="trash" />
            </UButton>
          </div>
        </div>
      </UCard>
    </div>

    <UEmpty
      v-else
      title="Keine Gottesdienste"
      description="Erstellen Sie einen Gottesdienst aus einer Vorlage."
    />
  </div>
</template>
