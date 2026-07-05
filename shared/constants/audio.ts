export const ALLOWED_AUDIO_EXTENSIONS = ['.mp3', '.wav', '.flac', '.ogg'] as const

export const ALLOWED_AUDIO_MIMES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/x-mpeg',
  'audio/mpeg3',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/vnd.wave',
  'audio/flac',
  'audio/x-flac',
  'audio/ogg',
  'application/ogg',
  'audio/vorbis'
] as const

export const AUDIO_FILE_ACCEPT = [
  ...ALLOWED_AUDIO_MIMES,
  ...ALLOWED_AUDIO_EXTENSIONS
].join(',')

export const MIME_BY_EXTENSION: Record<string, string> = {
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.flac': 'audio/flac',
  '.ogg': 'audio/ogg'
}

export function isAllowedAudioExtension(filename: string): boolean {
  const dot = filename.lastIndexOf('.')
  if (dot === -1) return false
  const ext = filename.slice(dot).toLowerCase()
  return (ALLOWED_AUDIO_EXTENSIONS as readonly string[]).includes(ext)
}

export function isAllowedAudioMime(mimeType: string): boolean {
  return (ALLOWED_AUDIO_MIMES as readonly string[]).includes(mimeType)
}
