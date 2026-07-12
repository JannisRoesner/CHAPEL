export default defineEventHandler(async () => {
  const customLogo = await getCustomLogoSetting()
  const copyrightHolder = await getCopyrightHolder()
  return {
    hasCustomLogo: !!customLogo,
    logoUrl: customLogo ? '/api/branding/logo' : '/favicon.svg',
    faviconUrl: customLogo ? '/api/branding/logo?size=32' : '/favicon.svg',
    copyrightHolder
  }
})
