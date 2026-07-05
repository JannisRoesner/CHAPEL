export default defineEventHandler(async () => {
  const customLogo = await getCustomLogoSetting()
  return {
    hasCustomLogo: !!customLogo,
    logoUrl: customLogo ? '/api/branding/logo' : '/favicon.svg',
    faviconUrl: customLogo ? '/api/branding/logo?size=32' : '/favicon.svg'
  }
})
