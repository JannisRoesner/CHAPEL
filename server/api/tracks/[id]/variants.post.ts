import { eq } from 'drizzle-orm'

import { useDb, schema } from '../../../database'
import { toTrackDto } from '../index.get'

/**
 * Legt eine nicht-destruktive Tempo-Variante an. Die Audiodatei wird nicht verändert –
 * Player wenden `playbackRate` (tonhöhenerhaltend) beim Abspielen an.
 */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Ungültige ID' })
  }

  const body = await readBody<{ playbackRate?: number, title?: string }>(event)
  const rate = normalizePlaybackRate(body.playbackRate)
  if (rate === 1) {
    throw createError({ statusCode: 400, statusMessage: 'Tempo entspricht dem Original' })
  }

  const db = useDb()
  const [source] = await db.select().from(schema.tracks).where(eq(schema.tracks.id, id)).limit(1)
  if (!source) {
    throw createError({ statusCode: 404, statusMessage: 'Track nicht gefunden' })
  }

  // Varianten hängen immer am Original
  const [parent] = source.parentTrackId
    ? await db.select().from(schema.tracks).where(eq(schema.tracks.id, source.parentTrackId)).limit(1)
    : [source]
  if (!parent) {
    throw createError({ statusCode: 404, statusMessage: 'Original nicht gefunden' })
  }

  const fileHash = variantFileHash(parent.fileHash, rate)
  const [existing] = await db.select().from(schema.tracks).where(eq(schema.tracks.fileHash, fileHash)).limit(1)
  if (existing) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Variante mit diesem Tempo existiert bereits',
      data: { existingTrack: toTrackDto(existing) }
    })
  }

  const [track] = await db
    .insert(schema.tracks)
    .values({
      title: body.title?.trim() || `${parent.title} (${formatPlaybackRate(rate)})`,
      composer: parent.composer,
      durationMs: parent.durationMs ? Math.round(parent.durationMs / rate) : null,
      category: parent.category,
      categoryId: parent.categoryId,
      fileHash,
      storageKey: parent.storageKey,
      originalFilename: parent.originalFilename,
      mimeType: parent.mimeType,
      fileSizeBytes: parent.fileSizeBytes,
      parentTrackId: parent.id,
      playbackRate: rate,
      createdBy: user.id
    })
    .returning()

  const dto = toTrackDto(track!)
  broadcastEvent({ type: 'track.created', payload: dto as unknown as Record<string, unknown> })
  return dto
})
