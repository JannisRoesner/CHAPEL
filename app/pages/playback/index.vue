<script setup lang="ts">
const servicesStore = useServicesStore()
const loading = ref(true)

onMounted(async () => {
  try {
    await servicesStore.fetchServices()
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader
      title="Wiedergabe"
      description="Gottesdienst für die Wiedergabe auswählen"
    />

    <div
      v-if="loading"
      class="grid gap-3 md:grid-cols-2"
    >
      <USkeleton
        v-for="i in 2"
        :key="i"
        class="h-28 w-full rounded-2xl"
      />
    </div>

    <div
      v-else-if="servicesStore.services.length"
      class="grid gap-3 md:grid-cols-2"
    >
      <NuxtLink
        v-for="service in servicesStore.services"
        :key="service.id"
        :to="`/playback/${service.id}`"
        class="press min-h-24 rounded-2xl border border-default bg-elevated/40 p-5 sm:p-6 hover:bg-elevated/70 flex items-center gap-4"
      >
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-lg truncate">
            {{ service.name }}
          </p>
          <p class="text-muted mt-1">
            {{ formatServiceDate(service.serviceDate) }}
          </p>
        </div>
        <div class="shrink-0 w-12 h-12 rounded-full bg-primary text-inverted flex items-center justify-center">
          <FontAwesomeIcon
            icon="play"
            class="text-lg translate-x-px"
          />
        </div>
      </NuxtLink>
    </div>

    <UEmpty
      v-else
      title="Keine Gottesdienste"
      description="Erstellen Sie zuerst einen Gottesdienst."
    >
      <UButton
        to="/services"
        class="min-h-12"
      >
        Zu Gottesdiensten
      </UButton>
    </UEmpty>
  </div>
</template>
