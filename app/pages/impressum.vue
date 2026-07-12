<script setup lang="ts">
const { data } = await useFetch<{ impressum: string, privacy: string }>('/api/legal', {
  key: 'legal-content'
})

const { loggedIn, fetch: fetchSession } = useUserSession()
await fetchSession()
setPageLayout(loggedIn.value ? 'default' : 'landing')

useHead({
  title: 'Impressum — CHAPEL'
})
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-12">
    <h1 class="text-3xl font-semibold mb-8">
      Impressum
    </h1>

    <UiMarkdownContent
      v-if="data?.impressum?.trim()"
      :content="data.impressum"
    />
    <p
      v-else
      class="text-muted"
    >
      Noch kein Inhalt hinterlegt.
    </p>
  </div>
</template>
