import { eq } from 'drizzle-orm'

import { useDb, schema } from '../../database'
import { toTrackDto } from './index.get'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Ungültige ID' })
  }

  const body = await readBody<{
    title?: string
    composer?: string | null
    category?: 'hymn' | 'liturgy'
    categoryId?: number | null
    playbackRate?: number
  }>(event)

  const db = useDb()
  const [existing] = await db
    .select()
    .from(schema.tracks)
    .where(eq(schema.tracks.id, id))
    .limit(1)

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Track nicht gefunden' })
  }

  // Tempo einer Variante ändern (Original bleibt immer 1.0)
  let variantUpdate: Partial<typeof schema.tracks.$inferInsert> = {}
  if (existing.parentTrackId && body.playbackRate !== undefined) {
    const rate = normalizePlaybackRate(body.playbackRate)
    const [parent] = await db.select().from(schema.tracks).where(eq(schema.tracks.id, existing.parentTrackId)).limit(1)
    if (parent && rate !== existing.playbackRate) {
      const fileHash = variantFileHash(parent.fileHash, rate)
      const [clash] = await db.select({ id: schema.tracks.id }).from(schema.tracks).where(eq(schema.tracks.fileHash, fileHash)).limit(1)
      if (clash) {
        throw createError({ statusCode: 409, statusMessage: 'Variante mit diesem Tempo existiert bereits' })
      }
      variantUpdate = {
        playbackRate: rate,
        fileHash,
        durationMs: parent.durationMs ? Math.round(parent.durationMs / rate) : null
      }
    }
  }

  const [track] = await db
    .update(schema.tracks)
    .set({
      title: body.title?.trim() || existing.title,
      composer: body.composer !== undefined ? body.composer : existing.composer,
      category: body.category ?? existing.category,
      categoryId: body.categoryId !== undefined ? body.categoryId : existing.categoryId,
      ...variantUpdate,
      updatedAt: new Date()
    })
    .where(eq(schema.tracks.id, id))
    .returning()

  const dto = toTrackDto(track!)
  broadcastEvent({ type: 'track.updated', payload: dto as unknown as Record<string, unknown> })
  return dto
})
