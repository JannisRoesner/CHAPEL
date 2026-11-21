import type { ElementTypeColor, ElementTypeDto } from '#shared/types/chapel'

/** Schlüssel der Grundtypen – nicht löschbar, Verhalten (fest/wählbar) nicht änderbar. */
export const SONG_KIND = 'songSlot'
export const LITURGY_KIND = 'liturgy'

/**
 * Vorgaben, solange die Liste vom Server noch nicht geladen ist (z. B. Startseite).
 * Die Datenbank (Tabelle `element_types`) ist die maßgebliche Quelle.
 */
export const BUILTIN_ELEMENT_TYPES: readonly ElementTypeDto[] = [
  { key: SONG_KIND, label: 'Lied', defaultLabel: 'Lied', fixed: false, color: 'primary', icon: 'i-lucide-music', sortOrder: 0, builtin: true },
  { key: LITURGY_KIND, label: 'Liturgie', defaultLabel: 'Liturgieelement', fixed: true, color: 'secondary', icon: 'i-lucide-lock', sortOrder: 1, builtin: true },
  { key: 'voluntary', label: 'Ein-/Ausgang', defaultLabel: 'Eingangsmusik', fixed: false, color: 'info', icon: 'i-lucide-door-open', sortOrder: 2, builtin: false },
  { key: 'communion', label: 'Abendmahl-Musik', defaultLabel: 'Musik zum Abendmahl', fixed: false, color: 'warning', icon: 'i-lucide-wine', sortOrder: 3, builtin: false }
]

export const ELEMENT_TYPE_COLORS: ReadonlyArray<{ value: ElementTypeColor, label: string }> = [
  { value: 'primary', label: 'Akzentfarbe' },
  { value: 'secondary', label: 'Liturgiefarbe' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'info', label: 'Blau' },
  { value: 'success', label: 'Grün' },
  { value: 'warning', label: 'Gold' },
  { value: 'error', label: 'Rot' }
]

/** Auswahl an Symbolen für eigene Elementtypen (Lucide). */
export const ELEMENT_TYPE_ICONS: readonly string[] = [
  'i-lucide-music',
  'i-lucide-music-2',
  'i-lucide-lock',
  'i-lucide-door-open',
  'i-lucide-wine',
  'i-lucide-church',
  'i-lucide-bell',
  'i-lucide-flame',
  'i-lucide-heart',
  'i-lucide-hand-heart',
  'i-lucide-book-open',
  'i-lucide-mic',
  'i-lucide-guitar',
  'i-lucide-drum',
  'i-lucide-piano',
  'i-lucide-baby',
  'i-lucide-gift',
  'i-lucide-sparkles',
  'i-lucide-star',
  'i-lucide-users'
]

export function isElementTypeColor(value: unknown): value is ElementTypeColor {
  return ELEMENT_TYPE_COLORS.some(c => c.value === value)
}

/** Typ zum Schlüssel; Unbekanntes verhält sich wie ein Lied. */
export function resolveElementType(types: readonly ElementTypeDto[], key: string): ElementTypeDto {
  return types.find(t => t.key === key)
    ?? types.find(t => t.key === SONG_KIND)
    ?? BUILTIN_ELEMENT_TYPES[0]!
}
