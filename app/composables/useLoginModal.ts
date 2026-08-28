export function useLoginModal() {
  const route = useRoute()
  const router = useRouter()

  const open = computed({
    get: () => {
      if (import.meta.client && !navigator.onLine) return false
      return route.path === '/' && route.query.login === '1'
    },
    set: (value: boolean) => {
      if (value && import.meta.client && !navigator.onLine) return
      const query = { ...route.query }
      if (value) {
        query.login = '1'
      } else {
        delete query.login
      }
      router.replace({ path: '/', query })
    }
  })

  function openLoginModal() {
    if (import.meta.client && !navigator.onLine) return
    open.value = true
  }

  function closeLoginModal() {
    open.value = false
  }

  return { open, openLoginModal, closeLoginModal }
}
