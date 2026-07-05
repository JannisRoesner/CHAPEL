import { useDb, schema } from '../../database'

export default defineEventHandler(async () => {
  const db = useDb()
  const rows = await db.select().from(schema.appSettings)
  return Object.fromEntries(rows.map(row => [row.key, row.value]))
})
