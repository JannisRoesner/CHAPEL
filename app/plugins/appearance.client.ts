export default defineNuxtPlugin(() => {
  const { user } = useUserSession()
  watch(() => user.value, () => {
    useAppearance().applyFromSession()
  }, { immediate: true })
})
