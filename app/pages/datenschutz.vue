<script setup lang="ts">
const { data } = await useFetch<{ impressum: string, privacy: string }>('/api/legal', {
  key: 'legal-content'
})

const { loggedIn, fetch: fetchSession } = useUserSession()
await fetchSession()
setPageLayout(loggedIn.value ? 'default' : 'landing')

useHead({
  title: 'Datenschutzerklärung — CHAPEL'
})
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-12">
    <h1 class="text-3xl font-semibold mb-8">
      Datenschutzerklärung
    </h1>

    <UiMarkdownContent
      v-if="data?.privacy?.trim()"
      :content="data.privacy"
    />
    <p
      v-else
      class="text-muted"
    >
      Noch kein Inhalt hinterlegt.
    </p>
  </div>
</template>
