export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  await removeCustomLogo()

  return {
    hasCustomLogo: false,
    logoUrl: '/favicon.svg',
    faviconUrl: '/favicon.svg'
  }
})
