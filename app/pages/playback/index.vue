<script setup lang="ts">
const servicesStore = useServicesStore()

onMounted(() => servicesStore.fetchServices())
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-semibold mb-1">Wiedergabe</h1>
      <p class="text-muted">Gottesdienst für die Wiedergabe auswählen</p>
    </div>

    <div v-if="servicesStore.services.length" class="grid gap-3 md:grid-cols-2">
      <NuxtLink
        v-for="service in servicesStore.services"
        :key="service.id"
        :to="`/playback/${service.id}`"
        class="block rounded-xl border border-default bg-elevated/30 p-6 hover:bg-elevated/60 transition-colors touch-manipulation"
      >
        <p class="font-semibold text-lg">{{ service.name }}</p>
        <p class="text-muted mt-1">{{ formatServiceDate(service.serviceDate) }}</p>
      </NuxtLink>
    </div>

    <UEmpty v-else title="Keine Gottesdienste" description="Erstellen Sie zuerst einen Gottesdienst.">
      <UButton to="/services">Zu Gottesdiensten</UButton>
    </UEmpty>
  </div>
</template>

<style scoped>
.touch-manipulation {
  touch-action: manipulation;
}
</style>
