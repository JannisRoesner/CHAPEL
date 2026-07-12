import { useDb, schema } from '../../database'
import { COPYRIGHT_HOLDER_KEY } from '#shared/constants/branding'
import { setCopyrightHolder } from '../../utils/branding'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<{ key?: string, value?: string }>(event)

  if (!body?.key?.trim() || body.value === undefined) {
    throw createError({ statusCode: 400, statusMessage: 'key und value erforderlich' })
  }

  const key = body.key.trim()

  if (key === COPYRIGHT_HOLDER_KEY) {
    await setCopyrightHolder(String(body.value))
    const rows = await useDb().select().from(schema.appSettings)
    return Object.fromEntries(rows.map(row => [row.key, row.value]))
  }

  if (String(body.value).length > 10_000) {
    throw createError({ statusCode: 400, statusMessage: 'value zu lang' })
  }

  const db = useDb()
  await db
    .insert(schema.appSettings)
    .values({ key: body.key.trim(), value: String(body.value) })
    .onConflictDoUpdate({
      target: schema.appSettings.key,
      set: { value: String(body.value) }
    })

  const rows = await db.select().from(schema.appSettings)
  return Object.fromEntries(rows.map(row => [row.key, row.value]))
})
