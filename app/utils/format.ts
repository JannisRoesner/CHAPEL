import type { TrackCategory } from '#shared/types/chapel'

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

/** Elementtyp zum Schlüssel (aus dem Store; vor dem Laden die Grundtypen). */
export function elementType(kind: string) {
  return useElementTypesStore().get(kind)
}

export function isFixedKind(kind: string): boolean {
  return elementType(kind).fixed
}

export function kindLabel(kind: string): string {
  return elementType(kind).label
}

export function categoryLabel(category: TrackCategory): string {
  return elementType(category).label
}

export function categoryColor(category: TrackCategory) {
  return elementType(category).color
}

/** Symbol nur für Zusatztypen, damit Lied/Liturgie ruhig bleiben */
export function categoryIcon(category: TrackCategory) {
  const type = elementType(category)
  return type.builtin ? undefined : type.icon
}
