import { unlink } from 'node:fs/promises'

import { eq } from 'drizzle-orm'

import { useDb, schema } from '../../database'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Ungültige ID' })
  }

  const db = useDb()
  const [existing] = await db
    .select()
    .from(schema.tracks)
    .where(eq(schema.tracks.id, id))
    .limit(1)

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Track nicht gefunden' })
  }

  await db.delete(schema.tracks).where(eq(schema.tracks.id, id))

  try {
    await unlink(getAudioFilePath(existing.storageKey))
  } catch {
    // file may already be missing
  }

  broadcastEvent({ type: 'track.deleted', payload: { id } })
  return { ok: true }
})
