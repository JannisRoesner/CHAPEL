import { eq } from 'drizzle-orm'

import { useDb, schema } from '../../database'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Ungültige ID' })
  }

  const db = useDb()
  const [deleted] = await db
    .delete(schema.serviceTypes)
    .where(eq(schema.serviceTypes.id, id))
    .returning({ id: schema.serviceTypes.id })

  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Gottesdienst-Typ nicht gefunden' })
  }

  broadcastEvent({ type: 'serviceType.deleted', payload: { id } })
  return { ok: true }
})
