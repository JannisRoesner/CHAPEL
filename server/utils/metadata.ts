import { parseBuffer } from 'music-metadata'

export interface ParsedAudioMetadata {
  title?: string
  composer?: string
  durationMs?: number
}

export async function parseAudioMetadata(
  buffer: Buffer,
  mimeType: string
): Promise<ParsedAudioMetadata> {
  try {
    const metadata = await parseBuffer(buffer, { mimeType })
    const title = metadata.common.title?.trim()
    const composer
      = metadata.common.composer?.[0]?.trim()
        || metadata.common.artist?.trim()
        || undefined
    const durationMs = metadata.format.duration
      ? Math.round(metadata.format.duration * 1000)
      : undefined

    return { title, composer, durationMs }
  } catch {
    return {}
  }
}
