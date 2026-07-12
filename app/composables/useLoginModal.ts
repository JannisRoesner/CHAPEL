export function useLoginModal() {
  const route = useRoute()
  const router = useRouter()

  const open = computed({
    get: () => route.path === '/' && route.query.login === '1',
    set: (value: boolean) => {
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
    open.value = true
  }

  function closeLoginModal() {
    open.value = false
  }

  return { open, openLoginModal, closeLoginModal }
}
