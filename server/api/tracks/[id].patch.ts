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

  const [track] = await db
    .update(schema.tracks)
    .set({
      title: body.title?.trim() || existing.title,
      composer: body.composer !== undefined ? body.composer : existing.composer,
      category: body.category ?? existing.category,
      categoryId: body.categoryId !== undefined ? body.categoryId : existing.categoryId,
      updatedAt: new Date()
    })
    .where(eq(schema.tracks.id, id))
    .returning()

  const dto = toTrackDto(track!)
  broadcastEvent({ type: 'track.updated', payload: dto as unknown as Record<string, unknown> })
  return dto
})
