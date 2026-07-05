export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<{
    colorScheme?: string
    appearanceMode?: string
  }>(event)

  const updated = await updateUserPreferences(user.id, body)
  await setUserSession(event, { user: updated })

  return updated
})
