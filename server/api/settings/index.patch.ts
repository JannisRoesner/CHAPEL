import { useDb, schema } from '../../database'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<{ key?: string, value?: string }>(event)

  if (!body?.key?.trim() || body.value === undefined) {
    throw createError({ statusCode: 400, statusMessage: 'key und value erforderlich' })
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
