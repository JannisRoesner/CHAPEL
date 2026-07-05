export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname
  if (path.startsWith('/api/auth/login') || path.startsWith('/api/auth/logout') || path.startsWith('/api/auth/me')) {
    return
  }
  if (path.startsWith('/api/') || path.startsWith('/ws/')) {
    if (path.startsWith('/ws/')) {
      return
    }
    await requireUser(event)
  }
})
