import { count, eq } from 'drizzle-orm'

import { schema, useDb } from '../../database'
import { requireAdmin } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const key = getRouterParam(event, 'key') ?? ''

  const db = useDb()
  const [existing] = await db.select().from(schema.elementTypes).where(eq(schema.elementTypes.key, key)).limit(1)
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Elementtyp nicht gefunden' })
  }
  if (existing.builtin) {
    throw createError({ statusCode: 400, statusMessage: 'Grundtypen können nicht gelöscht werden' })
  }

  // In Verwendung? Dann nicht löschen, damit Vorlagen und Gottesdienste nicht still ihren Typ verlieren
  const [[templates], [services], [tracks]] = await Promise.all([
    db.select({ n: count() }).from(schema.serviceTypeItems).where(eq(schema.serviceTypeItems.kind, key)),
    db.select({ n: count() }).from(schema.serviceItems).where(eq(schema.serviceItems.kind, key)),
    db.select({ n: count() }).from(schema.tracks).where(eq(schema.tracks.category, key))
  ])
  const usage = [
    templates!.n && `${templates!.n} Vorlagen-Schritt(e)`,
    services!.n && `${services!.n} Gottesdienst-Schritt(e)`,
    tracks!.n && `${tracks!.n} Track(s) in der Bibliothek`
  ].filter(Boolean)
  if (usage.length) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Elementtyp wird noch verwendet',
      message: `Noch verwendet von: ${usage.join(', ')}. Bitte zuerst dort einen anderen Typ wählen.`
    })
  }

  await db.delete(schema.elementTypes).where(eq(schema.elementTypes.key, key))
  broadcastElementTypes()
  return { ok: true }
})
