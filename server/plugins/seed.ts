export default defineNitroPlugin(async () => {
  await ensureAudioStorage()
  await seedAdminIfNeeded()
  await seedDefaultServiceTypeIfNeeded()
})
