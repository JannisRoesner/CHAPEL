export type ItemKind = 'liturgy' | 'songSlot'
export type TrackCategory = 'hymn' | 'liturgy'
export type UserRole = 'admin' | 'editor'

export type { AppearanceMode, ColorSchemeId } from '#shared/constants/colorSchemes'

export interface SessionUser {
  id: number
  email: string
  name: string
  role: UserRole
  mustChangePassword: boolean
  colorScheme: import('#shared/constants/colorSchemes').ColorSchemeId
  appearanceMode: import('#shared/constants/colorSchemes').AppearanceMode
}

export interface UserDto {
  id: number
  email: string
  name: string
  role: UserRole
  mustChangePassword: boolean
  createdAt: string
}

export interface TrackDto {
  id: number
  title: string
  composer: string | null
  durationMs: number | null
  category: TrackCategory
  categoryId: number | null
  fileHash: string
  originalFilename: string
  mimeType: string
  fileSizeBytes: number
  createdAt: string
  updatedAt: string
}

export interface CategoryDto {
  id: number
  name: string
  sortOrder: number
}

export interface ServiceTypeItemDto {
  id: number
  serviceTypeId: number
  position: number
  kind: ItemKind
  label: string
  defaultTrackId: number | null
  defaultTrack?: TrackDto | null
}

export interface ServiceTypeDto {
  id: number
  name: string
  description: string | null
  items?: ServiceTypeItemDto[]
  createdAt: string
  updatedAt: string
}

export interface ServiceItemDto {
  id: number
  serviceId: number
  position: number
  kind: ItemKind
  label: string
  trackId: number | null
  track?: TrackDto | null
}

export interface ServiceDto {
  id: number
  serviceTypeId: number
  name: string
  serviceDate: string
  notes: string | null
  serviceType?: ServiceTypeDto
  items?: ServiceItemDto[]
  createdAt: string
  updatedAt: string
}

export interface PlaylistStepDto {
  id: number
  position: number
  kind: ItemKind
  label: string
  trackId: number | null
  title: string | null
  composer: string | null
  durationMs: number | null
  streamUrl: string | null
}

export type ChapelEventType
  = | 'track.created'
    | 'track.updated'
    | 'track.deleted'
    | 'serviceType.created'
    | 'serviceType.updated'
    | 'serviceType.deleted'
    | 'service.created'
    | 'service.updated'
    | 'service.deleted'

export interface ChapelEvent {
  type: ChapelEventType
  payload: Record<string, unknown>
}
