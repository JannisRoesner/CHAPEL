import type { TrackCategory } from '#shared/types/chapel'

/** Reihenfolge = Anzeige-Reihenfolge in Filtern und Auswahllisten. */
export const TRACK_CATEGORIES: readonly TrackCategory[] = ['hymn', 'voluntary', 'liturgy']

export function isTrackCategory(value: unknown): value is TrackCategory {
  return TRACK_CATEGORIES.includes(value as TrackCategory)
}

/** Unbekannte Werte fallen auf „Lied“ zurück. */
export function parseTrackCategory(value: unknown): TrackCategory {
  return isTrackCategory(value) ? value : 'hymn'
}

export const TRACK_CATEGORY_LABELS: Record<TrackCategory, string> = {
  hymn: 'Lied',
  voluntary: 'Ein-/Ausgang',
  liturgy: 'Liturgie'
}
