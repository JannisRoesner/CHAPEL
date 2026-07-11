import type { ItemKind, PlaylistStepDto, ServiceItemDto, TrackDto } from '#shared/types/chapel'

const DEMO_NOW = '2026-01-01T00:00:00.000Z'

export const DEMO_TRACKS: TrackDto[] = [
  {
    id: 1,
    title: 'Lobe den Herren',
    composer: 'Joachim Neander',
    durationMs: 245000,
    category: 'hymn',
    categoryId: null,
    fileHash: 'demo1',
    originalFilename: 'lobe-den-herren.mp3',
    mimeType: 'audio/mpeg',
    fileSizeBytes: 4_200_000,
    createdAt: DEMO_NOW,
    updatedAt: DEMO_NOW
  },
  {
    id: 2,
    title: 'Kyrie eleison',
    composer: 'Liturgisch',
    durationMs: 95000,
    category: 'liturgy',
    categoryId: null,
    fileHash: 'demo2',
    originalFilename: 'kyrie.mp3',
    mimeType: 'audio/mpeg',
    fileSizeBytes: 1_800_000,
    createdAt: DEMO_NOW,
    updatedAt: DEMO_NOW
  },
  {
    id: 3,
    title: 'Gloria in excelsis',
    composer: 'Liturgisch',
    durationMs: 180000,
    category: 'liturgy',
    categoryId: null,
    fileHash: 'demo3',
    originalFilename: 'gloria.mp3',
    mimeType: 'audio/mpeg',
    fileSizeBytes: 3_100_000,
    createdAt: DEMO_NOW,
    updatedAt: DEMO_NOW
  },
  {
    id: 4,
    title: 'Nun danket alle Gott',
    composer: 'Johann Crüger',
    durationMs: 198000,
    category: 'hymn',
    categoryId: null,
    fileHash: 'demo4',
    originalFilename: 'nun-danket.mp3',
    mimeType: 'audio/mpeg',
    fileSizeBytes: 3_400_000,
    createdAt: DEMO_NOW,
    updatedAt: DEMO_NOW
  }
]

export interface DemoServiceTypeItem {
  position: number
  kind: ItemKind
  label: string
  trackTitle: string | null
}

export const DEMO_SERVICE_TYPE_ITEMS: DemoServiceTypeItem[] = [
  { position: 0, kind: 'songSlot', label: 'Eröffnungslied', trackTitle: null },
  { position: 1, kind: 'liturgy', label: 'Kyrie', trackTitle: 'Kyrie eleison' },
  { position: 2, kind: 'liturgy', label: 'Gloria', trackTitle: 'Gloria in excelsis' },
  { position: 3, kind: 'songSlot', label: 'Prediglied', trackTitle: null },
  { position: 4, kind: 'songSlot', label: 'Schlusslied', trackTitle: 'Nun danket alle Gott' }
]

export const DEMO_SERVICE_ITEMS: ServiceItemDto[] = [
  {
    id: 1,
    serviceId: 1,
    position: 0,
    kind: 'songSlot',
    label: 'Eröffnungslied',
    trackId: 1,
    track: DEMO_TRACKS[0]
  },
  {
    id: 2,
    serviceId: 1,
    position: 1,
    kind: 'liturgy',
    label: 'Kyrie',
    trackId: 2,
    track: DEMO_TRACKS[1]
  },
  {
    id: 3,
    serviceId: 1,
    position: 2,
    kind: 'liturgy',
    label: 'Gloria',
    trackId: 3,
    track: DEMO_TRACKS[2]
  },
  {
    id: 4,
    serviceId: 1,
    position: 3,
    kind: 'songSlot',
    label: 'Prediglied',
    trackId: null,
    track: null
  },
  {
    id: 5,
    serviceId: 1,
    position: 4,
    kind: 'songSlot',
    label: 'Schlusslied',
    trackId: 4,
    track: DEMO_TRACKS[3]
  }
]

export const DEMO_PLAYLIST_STEPS: PlaylistStepDto[] = [
  {
    id: 1,
    position: 0,
    kind: 'songSlot',
    label: 'Eröffnungslied',
    trackId: 1,
    title: 'Lobe den Herren',
    composer: 'Joachim Neander',
    durationMs: 245000,
    streamUrl: null
  },
  {
    id: 2,
    position: 1,
    kind: 'liturgy',
    label: 'Kyrie',
    trackId: 2,
    title: 'Kyrie eleison',
    composer: 'Liturgisch',
    durationMs: 95000,
    streamUrl: null
  },
  {
    id: 3,
    position: 2,
    kind: 'liturgy',
    label: 'Gloria',
    trackId: 3,
    title: 'Gloria in excelsis',
    composer: 'Liturgisch',
    durationMs: 180000,
    streamUrl: null
  },
  {
    id: 4,
    position: 3,
    kind: 'songSlot',
    label: 'Prediglied',
    trackId: null,
    title: null,
    composer: null,
    durationMs: null,
    streamUrl: null
  },
  {
    id: 5,
    position: 4,
    kind: 'songSlot',
    label: 'Schlusslied',
    trackId: 4,
    title: 'Nun danket alle Gott',
    composer: 'Johann Crüger',
    durationMs: 198000,
    streamUrl: null
  }
]

export interface LandingFeature {
  id: string
  title: string
  description: string
  hint?: string
}

export const LANDING_FEATURES: LandingFeature[] = [
  {
    id: 'library',
    title: 'Audiodateien verwalten',
    description: 'Laden Sie MP3s hoch — Titel, Komponist und Dauer werden automatisch erkannt. Kategorisieren Sie Lieder und Liturgie, filtern Sie die Bibliothek und vermeiden Sie Duplikate durch automatische Prüfung.'
  },
  {
    id: 'service-types',
    title: 'Gottesdienst-Vorlagen',
    description: 'Definieren Sie den Ablauf eines Gottesdienstes: Liturgieelemente bleiben fix, Lied-Slots können pro Termin neu befüllt werden. Reihenfolge anpassen und Standard-Lieder vorgeben.'
  },
  {
    id: 'services',
    title: 'Gottesdienste planen',
    description: 'Erstellen Sie konkrete Gottesdienste aus einer Vorlage, weisen Sie Lieder zu und bereiten Sie alles offline vor — Liturgieelemente sind dabei fest vorgegeben.'
  },
  {
    id: 'playback',
    title: 'Touch-Wiedergabe',
    description: 'Steuern Sie den Gottesdienst mit großen Buttons: Play, Stopp nach jedem Titel und „Nächster“ für den nächsten Schritt. Ideal für Tablet oder Touchscreen am Altar.',
    hint: 'Nach jedem Titel stoppt die Wiedergabe — der nächste Schritt startet bewusst per Knopfdruck.'
  },
  {
    id: 'realtime',
    title: 'Gemeinsame Bibliothek',
    description: 'Mehrere Nutzer können parallel in CHAPEL arbeiten. Neu hochgeladene, bearbeitete oder gelöschte Audiodateien erscheinen in der Bibliothek auf allen Geräten automatisch — ohne Seite neu zu laden. Neu angelegte Gottesdienste tauchen ebenfalls in der Übersicht auf.',
    hint: 'Geöffnete Detail-Ansichten (z. B. einzelner Gottesdienst oder Vorlage) zeigen Änderungen anderer Nutzer erst nach erneutem Öffnen.'
  },
  {
    id: 'offline',
    title: 'Offline & PWA',
    description: 'Installieren Sie CHAPEL als App und bereiten Sie Gottesdienste offline vor. Alle Audiodateien werden lokal zwischengespeichert — Wiedergabe auch ohne Netzwerk.'
  }
]

export interface LandingMoreFeature {
  title: string
  description: string
  icon: string
}

export const LANDING_MORE_FEATURES: LandingMoreFeature[] = [
  {
    title: 'Benutzerverwaltung',
    description: 'Admins legen Nutzer an, vergeben Rollen (Admin/Editor) und setzen Passwörter zurück.',
    icon: 'users'
  },
  {
    title: 'Gemeinde-Branding',
    description: 'Eigenes Logo als Navigations-Icon und Favicon — passend zu Ihrer Gemeinde.',
    icon: 'image'
  },
  {
    title: 'Erscheinungsbild',
    description: 'Hell, Dunkel oder System — plus fünf Farbschemata für unterschiedliche Stimmungen.',
    icon: 'palette'
  },
  {
    title: 'Self-Hosted',
    description: 'Docker-Deployment für eine Gemeinde pro Installation — Ihre Daten bleiben bei Ihnen.',
    icon: 'server'
  },
  {
    title: 'Touch-optimiert',
    description: 'Große Bedienelemente und Vollbild-Wiedergabe für den Einsatz während des Gottesdienstes.',
    icon: 'hand-pointer'
  },
  {
    title: 'Sicherer Login',
    description: 'Session-basierte Anmeldung mit Passwortwechsel beim ersten Login.',
    icon: 'lock'
  }
]

export interface LandingWorkflowStep {
  step: number
  title: string
  description: string
}

export const LANDING_WORKFLOW_STEPS: LandingWorkflowStep[] = [
  {
    step: 1,
    title: 'Bibliothek',
    description: 'Audiodateien hochladen und kategorisieren'
  },
  {
    step: 2,
    title: 'Vorlage',
    description: 'Gottesdienst-Ablauf mit Liturgie- und Lied-Slots definieren'
  },
  {
    step: 3,
    title: 'Gottesdienst',
    description: 'Konkreten Termin anlegen, Lieder zuweisen, offline vorbereiten'
  },
  {
    step: 4,
    title: 'Wiedergabe',
    description: 'Touch-gesteuert abspielen — Schritt für Schritt'
  }
]
