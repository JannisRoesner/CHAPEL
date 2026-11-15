import { PLAYBACK_RATE_MAX, PLAYBACK_RATE_MIN } from '#shared/constants/audio'

/** Klemmt einen Tempo-Faktor in den erlaubten Bereich und rundet auf 2 Nachkommastellen. */
export function normalizePlaybackRate(value: unknown): number {
  const num = Number(value)
  if (!Number.isFinite(num)) return 1
  const clamped = Math.min(PLAYBACK_RATE_MAX, Math.max(PLAYBACK_RATE_MIN, num))
  return Math.round(clamped * 100) / 100
}

/** „92 %“ – Anzeige eines Tempo-Faktors */
export function formatPlaybackRate(rate: number): string {
  return `${Math.round(rate * 100)} %`
}
