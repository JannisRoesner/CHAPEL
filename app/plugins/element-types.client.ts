/** Lädt die Elementtypen, sobald jemand angemeldet ist. */
export default defineNuxtPlugin(() => {
  const { loggedIn } = useUserSession()
  const store = useElementTypesStore()
  watch(loggedIn, (value) => {
    if (value) void store.fetchTypes()
  }, { immediate: true })
})
