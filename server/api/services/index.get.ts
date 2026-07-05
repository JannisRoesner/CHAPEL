import { desc } from 'drizzle-orm'

import { useDb, schema } from '../../database'
import type { ServiceDto } from '#shared/types/chapel'

export default defineEventHandler(async () => {
  const db = useDb()
  const rows = await db
    .select()
    .from(schema.services)
    .orderBy(desc(schema.services.serviceDate))

  return rows.map((s): ServiceDto => ({
    id: s.id,
    serviceTypeId: s.serviceTypeId,
    name: s.name,
    serviceDate: s.serviceDate.toISOString(),
    notes: s.notes,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString()
  }))
})
