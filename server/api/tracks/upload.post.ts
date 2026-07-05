import { writeFile } from 'node:fs/promises'
import { extname } from 'node:path'

import { eq } from 'drizzle-orm'

import {
  isAllowedAudioExtension,
  isAllowedAudioMime,
  MIME_BY_EXTENSION
} from '#shared/constants/audio'

import { useDb, schema } from '../../database'
import { toTrackDto } from './index.get'

const MAX_FILE_SIZE = 50 * 1024 * 1024

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const form = await readMultipartFormData(event)

  if (!form?.length) {
    throw createError({ statusCode: 400, statusMessage: 'Keine Datei hochgeladen' })
  }

  const filePart = form.find(part => part.name === 'file' && part.data)
  const categoryPart = form.find(part => part.name === 'category')
  const titlePart = form.find(part => part.name === 'title')

  if (!filePart?.data || !filePart.filename) {
    throw createError({ statusCode: 400, statusMessage: 'Keine Datei hochgeladen' })
  }

  if (filePart.data.length > MAX_FILE_SIZE) {
    throw createError({ statusCode: 400, statusMessage: 'Datei zu groß (max. 50 MB)' })
  }

  const ext = extname(filePart.filename).toLowerCase()
  const mimeType = filePart.type || MIME_BY_EXTENSION[ext] || 'application/octet-stream'
  if (!isAllowedAudioMime(mimeType) && !isAllowedAudioExtension(filePart.filename)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Nur MP3-, WAV-, FLAC- und OGG-Dateien erlaubt'
    })
  }

  const fileHash = sha256(filePart.data)
  const db = useDb()

  const [existing] = await db
    .select()
    .from(schema.tracks)
    .where(eq(schema.tracks.fileHash, fileHash))
    .limit(1)

  if (existing) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Datei bereits vorhanden',
      data: { existingTrack: toTrackDto(existing) }
    })
  }

  const parsed = await parseAudioMetadata(filePart.data, mimeType)
  const categoryValue
    = categoryPart?.data?.toString() === 'liturgy' ? 'liturgy' : 'hymn'
  const title
    = titlePart?.data?.toString().trim()
      || parsed.title
      || filePart.filename.replace(/\.[^.]+$/, '')

  const storageKey = `${fileHash}${ext || '.mp3'}`
  const storagePath = getAudioFilePath(storageKey)
  await ensureAudioStorage()
  await writeFile(storagePath, filePart.data)

  const [track] = await db
    .insert(schema.tracks)
    .values({
      title,
      composer: parsed.composer ?? null,
      durationMs: parsed.durationMs ?? null,
      category: categoryValue,
      fileHash,
      storageKey,
      originalFilename: filePart.filename,
      mimeType,
      fileSizeBytes: filePart.data.length,
      createdBy: user.id
    })
    .returning()

  const dto = toTrackDto(track!)
  broadcastEvent({ type: 'track.created', payload: dto as unknown as Record<string, unknown> })
  return dto
})
