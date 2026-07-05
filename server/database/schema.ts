import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex
} from 'drizzle-orm/pg-core'

export const userRoleEnum = pgEnum('user_role', ['admin', 'editor'])
export const trackCategoryEnum = pgEnum('track_category', ['hymn', 'liturgy'])
export const itemKindEnum = pgEnum('item_kind', ['liturgy', 'songSlot'])

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: userRoleEnum('role').notNull().default('editor'),
  mustChangePassword: boolean('must_change_password').notNull().default(false),
  colorScheme: text('color_scheme').notNull().default('chapel-green'),
  appearanceMode: text('appearance_mode').notNull().default('system'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
})

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  sortOrder: integer('sort_order').notNull().default(0)
})

export const tracks = pgTable(
  'tracks',
  {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    composer: text('composer'),
    durationMs: integer('duration_ms'),
    category: trackCategoryEnum('category').notNull().default('hymn'),
    categoryId: integer('category_id').references(() => categories.id, {
      onDelete: 'set null'
    }),
    fileHash: text('file_hash').notNull(),
    storageKey: text('storage_key').notNull(),
    originalFilename: text('original_filename').notNull(),
    mimeType: text('mime_type').notNull(),
    fileSizeBytes: integer('file_size_bytes').notNull(),
    createdBy: integer('created_by').references(() => users.id, {
      onDelete: 'set null'
    }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
  },
  table => [uniqueIndex('tracks_file_hash_idx').on(table.fileHash)]
)

export const serviceTypes = pgTable('service_types', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
})

export const serviceTypeItems = pgTable('service_type_items', {
  id: serial('id').primaryKey(),
  serviceTypeId: integer('service_type_id')
    .notNull()
    .references(() => serviceTypes.id, { onDelete: 'cascade' }),
  position: integer('position').notNull(),
  kind: itemKindEnum('kind').notNull(),
  label: text('label').notNull(),
  defaultTrackId: integer('default_track_id').references(() => tracks.id, {
    onDelete: 'set null'
  })
})

export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  serviceTypeId: integer('service_type_id')
    .notNull()
    .references(() => serviceTypes.id, { onDelete: 'restrict' }),
  name: text('name').notNull(),
  serviceDate: timestamp('service_date', { withTimezone: true }).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
})

export const serviceItems = pgTable('service_items', {
  id: serial('id').primaryKey(),
  serviceId: integer('service_id')
    .notNull()
    .references(() => services.id, { onDelete: 'cascade' }),
  position: integer('position').notNull(),
  kind: itemKindEnum('kind').notNull(),
  label: text('label').notNull(),
  trackId: integer('track_id').references(() => tracks.id, { onDelete: 'set null' })
})

export const appSettings = pgTable('app_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull()
})

export type User = typeof users.$inferSelect
export type Track = typeof tracks.$inferSelect
export type Category = typeof categories.$inferSelect
export type ServiceType = typeof serviceTypes.$inferSelect
export type ServiceTypeItem = typeof serviceTypeItems.$inferSelect
export type Service = typeof services.$inferSelect
export type ServiceItem = typeof serviceItems.$inferSelect
