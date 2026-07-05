import { createReadStream, existsSync } from 'node:fs'

import { eq } from 'drizzle-orm'

import { useDb, schema } from '../../../database'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Ungültige ID' })
  }

  const db = useDb()
  const [track] = await db
    .select()
    .from(schema.tracks)
    .where(eq(schema.tracks.id, id))
    .limit(1)

  if (!track) {
    throw createError({ statusCode: 404, statusMessage: 'Track nicht gefunden' })
  }

  const filePath = getAudioFilePath(track.storageKey)
  if (!existsSync(filePath)) {
    throw createError({ statusCode: 404, statusMessage: 'Audiodatei nicht gefunden' })
  }

  setHeader(event, 'Content-Type', track.mimeType)
  setHeader(event, 'Accept-Ranges', 'bytes')
  setHeader(event, 'Cache-Control', 'private, max-age=3600')

  return sendStream(event, createReadStream(filePath))
})
