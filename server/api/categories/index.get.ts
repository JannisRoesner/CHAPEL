import { asc } from 'drizzle-orm'

import { useDb, schema } from '../../database'

export default defineEventHandler(async () => {
  const db = useDb()
  return db.select().from(schema.categories).orderBy(asc(schema.categories.sortOrder))
})
