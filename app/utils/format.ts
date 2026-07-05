export function formatDuration(ms: number | null | undefined): string {
  if (!ms || ms <= 0) return '–'
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function formatServiceDate(iso: string): string {
  return new Date(iso).toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

export function categoryLabel(category: 'hymn' | 'liturgy'): string {
  return category === 'liturgy' ? 'Liturgie' : 'Lied'
}

export function kindLabel(kind: 'liturgy' | 'songSlot'): string {
  return kind === 'liturgy' ? 'Liturgie' : 'Lied-Slot'
}
