export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/login') return

  const { loggedIn, fetch: fetchSession } = useUserSession()
  await fetchSession()

  if (!loggedIn.value) {
    return navigateTo('/login')
  }
})
