import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { Readable } from 'node:stream'
import { crc32 } from 'node:zlib'

import { asc, eq } from 'drizzle-orm'

import { schema, useDb } from '../database'
import type { PackageAudioDto, PackageManifestDto } from '#shared/types/chapel'

export const PACKAGE_FORMAT_VERSION = 1 as const

/** Baut das Manifest eines Gottesdienst-Pakets. Gibt `null` zurück, wenn der Gottesdienst fehlt. */
export async function buildPackageManifest(serviceId: number): Promise<PackageManifestDto | null> {
  const db = useDb()
  const [service] = await db.select().from(schema.services).where(eq(schema.services.id, serviceId)).limit(1)
  if (!service) return null

  const rows = await db
    .select({ item: schema.serviceItems, track: schema.tracks })
    .from(schema.serviceItems)
    .leftJoin(schema.tracks, eq(schema.serviceItems.trackId, schema.tracks.id))
    .where(eq(schema.serviceItems.serviceId, serviceId))
    .orderBy(asc(schema.serviceItems.position))

  // Tempo-Varianten teilen die Datei des Originals (Hash = Teil vor „@“)
  const audioByKey = new Map<string, PackageAudioDto>()
  const steps = rows.map(({ item, track }) => {
    let audio: PackageAudioDto | null = null
    if (track) {
      audio = audioByKey.get(track.storageKey) ?? {
        file: `audio/${track.storageKey}`,
        sha256: track.fileHash.split('@')[0]!,
        mimeType: track.mimeType,
        sizeBytes: track.fileSizeBytes,
        url: `/api/tracks/${track.parentTrackId ?? track.id}/stream`
      }
      audioByKey.set(track.storageKey, audio)
    }
    return {
      position: item.position,
      kind: item.kind,
      label: item.label,
      title: track?.title ?? null,
      composer: track?.composer ?? null,
      durationMs: track?.durationMs ?? null,
      playbackRate: track?.playbackRate ?? 1,
      audio
    }
  })

  const serviceInfo = {
    id: service.id,
    name: service.name,
    serviceDate: service.serviceDate.toISOString(),
    notes: service.notes,
    updatedAt: service.updatedAt.toISOString()
  }
  const version = createHash('sha256')
    .update(JSON.stringify({
      f: PACKAGE_FORMAT_VERSION,
      s: [serviceInfo.name, serviceInfo.serviceDate, serviceInfo.notes],
      steps
    }))
    .digest('hex')
    .slice(0, 32)

  return {
    formatVersion: PACKAGE_FORMAT_VERSION,
    version,
    generatedAt: new Date().toISOString(),
    service: serviceInfo,
    steps,
    totalAudioBytes: [...audioByKey.values()].reduce((sum, a) => sum + a.sizeBytes, 0)
  }
}

interface ZipEntry {
  name: Buffer
  size: number
  crc: number
  offset: number
  source: Buffer | string
}

const ZIP_MAX = 0xFFFFFFFF
const DOS_TIME = 0
const DOS_DATE = (1 << 5) | 1 // 1980-01-01

async function fileCrc(path: string): Promise<number> {
  let crc = 0
  for await (const chunk of createReadStream(path)) crc = crc32(chunk as Buffer, crc)
  return crc
}

function header(e: ZipEntry, central: boolean): Buffer {
  const h = Buffer.alloc(central ? 46 : 30)
  let o = 0
  h.writeUInt32LE(central ? 0x02014B50 : 0x04034B50, o)
  o += 4
  if (central) {
    h.writeUInt16LE(20, o)
    o += 2
  }
  h.writeUInt16LE(20, o) // version needed
  h.writeUInt16LE(0x0800, o + 2) // UTF-8 names
  h.writeUInt16LE(0, o + 4) // STORE
  h.writeUInt16LE(DOS_TIME, o + 6)
  h.writeUInt16LE(DOS_DATE, o + 8)
  h.writeUInt32LE(e.crc >>> 0, o + 10)
  h.writeUInt32LE(e.size, o + 14)
  h.writeUInt32LE(e.size, o + 18)
  h.writeUInt16LE(e.name.length, o + 22)
  if (central) h.writeUInt32LE(e.offset, 42)
  return Buffer.concat([h, e.name])
}

/**
 * Erzeugt einen unkomprimierten ZIP-Container (Methode STORE, kein ZIP64) mit
 * `manifest.json` und `audio/*`. Audio ist bereits komprimiert; STORE erlaubt
 * Streaming mit vorab bekannter Content-Length.
 */
export async function createPackageZip(manifest: PackageManifestDto) {
  const manifestBuf = Buffer.from(JSON.stringify(manifest, null, 2), 'utf8')
  const entries: ZipEntry[] = [{
    name: Buffer.from('manifest.json'),
    size: manifestBuf.length,
    crc: crc32(manifestBuf),
    offset: 0,
    source: manifestBuf
  }]

  const seen = new Set<string>()
  for (const step of manifest.steps) {
    if (!step.audio || seen.has(step.audio.file)) continue
    seen.add(step.audio.file)
    const path = getAudioFilePath(step.audio.file.slice('audio/'.length))
    const { size } = await stat(path)
    entries.push({ name: Buffer.from(step.audio.file), size, crc: await fileCrc(path), offset: 0, source: path })
  }

  let offset = 0
  for (const entry of entries) {
    entry.offset = offset
    offset += 30 + entry.name.length + entry.size
  }
  const centralSize = entries.reduce((sum, e) => sum + 46 + e.name.length, 0)
  const totalSize = offset + centralSize + 22
  if (totalSize > ZIP_MAX || entries.length > 0xFFFF) {
    throw createError({ statusCode: 413, statusMessage: 'Paket zu groß (max. 4 GB)' })
  }

  async function* generate() {
    for (const entry of entries) {
      yield header(entry, false)
      if (Buffer.isBuffer(entry.source)) yield entry.source
      else yield* createReadStream(entry.source)
    }
    for (const entry of entries) yield header(entry, true)
    const end = Buffer.alloc(22)
    end.writeUInt32LE(0x06054B50, 0)
    end.writeUInt16LE(entries.length, 8)
    end.writeUInt16LE(entries.length, 10)
    end.writeUInt32LE(centralSize, 12)
    end.writeUInt32LE(offset, 16)
    yield end
  }

  return { stream: Readable.from(generate()), size: totalSize }
}
