import type { SessionUser } from '#shared/types/chapel'

export default defineNuxtPlugin(() => {
  const { loggedIn, user } = useUserSession()
  const { saveLocalSession } = useLocalSession()

  watch(
    [loggedIn, user],
    ([isLoggedIn, currentUser]) => {
      if (isLoggedIn && currentUser) {
        saveLocalSession(currentUser as SessionUser)
      }
    },
    { immediate: true }
  )
})
