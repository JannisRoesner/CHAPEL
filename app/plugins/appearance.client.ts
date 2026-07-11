export default defineNuxtPlugin(() => {
  const { user } = useUserSession()
  watch(() => user.value, () => {
    if (!user.value) return
    useAppearance().applyFromSession()
  }, { immediate: true })
})
