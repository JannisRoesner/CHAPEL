import { eq } from 'drizzle-orm'

import { useDb, schema } from '../../database'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Ungültige ID' })
  }

  const db = useDb()
  const [deleted] = await db
    .delete(schema.services)
    .where(eq(schema.services.id, id))
    .returning({ id: schema.services.id })

  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Gottesdienst nicht gefunden' })
  }

  broadcastEvent({ type: 'service.deleted', payload: { id } })
  return { ok: true }
})
