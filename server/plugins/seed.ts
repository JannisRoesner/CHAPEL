export default defineNitroPlugin(async () => {
  await ensureAudioStorage()
  await ensureBrandingStorage()
  await seedAdminIfNeeded()
  await seedDefaultServiceTypeIfNeeded()
})
