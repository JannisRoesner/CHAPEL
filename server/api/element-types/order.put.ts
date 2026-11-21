import { eq } from 'drizzle-orm'

import { schema, useDb } from '../../database'
import { requireAdmin } from '../../utils/auth'

/** Reihenfolge der Elementtypen setzen: `{ keys: string[] }` */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<{ keys?: unknown }>(event)
  if (!Array.isArray(body.keys) || body.keys.some(k => typeof k !== 'string')) {
    throw createError({ statusCode: 400, statusMessage: 'keys erforderlich' })
  }

  const db = useDb()
  await db.transaction(async (tx) => {
    for (const [index, key] of (body.keys as string[]).entries()) {
      await tx.update(schema.elementTypes).set({ sortOrder: index }).where(eq(schema.elementTypes.key, key))
    }
  })

  broadcastElementTypes()
  return listElementTypes()
})
