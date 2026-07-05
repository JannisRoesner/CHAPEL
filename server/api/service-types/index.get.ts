import { asc } from 'drizzle-orm'

import { useDb, schema } from '../../database'
import type { ServiceTypeDto } from '#shared/types/chapel'

export default defineEventHandler(async () => {
  const db = useDb()
  const types = await db.select().from(schema.serviceTypes).orderBy(asc(schema.serviceTypes.name))
  return types.map((t): ServiceTypeDto => ({
    id: t.id,
    name: t.name,
    description: t.description,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString()
  }))
})
