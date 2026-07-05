import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'

export function getAudioStoragePath(): string {
  return process.env.AUDIO_STORAGE_PATH || join(process.cwd(), 'data', 'audio')
}

export async function ensureAudioStorage(): Promise<string> {
  const path = getAudioStoragePath()
  await mkdir(path, { recursive: true })
  return path
}

export function getAudioFilePath(storageKey: string): string {
  return join(getAudioStoragePath(), storageKey)
}
