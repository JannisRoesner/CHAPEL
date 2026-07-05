import bcrypt from 'bcryptjs'
import { asc, eq } from 'drizzle-orm'
import type { H3Event } from 'h3'

import { useDb, schema } from '../database'

import type { SessionUser, UserDto, UserRole } from '#shared/types/chapel'

export async function hashUserPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyUserPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash)
}

export async function findUserByEmail(email: string) {
  const db = useDb()
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email.toLowerCase().trim()))
    .limit(1)
  return user ?? null
}

export async function requireUser(event: H3Event): Promise<SessionUser> {
  const session = await getUserSession(event)
  const user = session.user as SessionUser | undefined
  if (!user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Nicht angemeldet' })
  }
  return user
}

export async function requireAdmin(event: H3Event): Promise<SessionUser> {
  const user = await requireUser(event)
  if (user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Keine Berechtigung' })
  }
  return user
}

export function toSessionUser(user: typeof schema.users.$inferSelect): SessionUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  }
}

export function toUserDto(user: typeof schema.users.$inferSelect): UserDto {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt.toISOString()
  }
}

export async function listUsers(): Promise<UserDto[]> {
  const db = useDb()
  const rows = await db.select().from(schema.users).orderBy(asc(schema.users.createdAt))
  return rows.map(toUserDto)
}

export async function createUser(input: {
  email: string
  name: string
  password: string
  role?: UserRole
}): Promise<UserDto> {
  const email = input.email.toLowerCase().trim()
  const name = input.name.trim()

  if (!email || !name || !input.password) {
    throw createError({ statusCode: 400, statusMessage: 'Alle Felder erforderlich' })
  }
  if (input.password.length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'Passwort muss mindestens 8 Zeichen haben' })
  }
  if (await findUserByEmail(email)) {
    throw createError({ statusCode: 409, statusMessage: 'E-Mail-Adresse bereits vergeben' })
  }

  const role: UserRole = input.role === 'admin' ? 'admin' : 'editor'
  const passwordHash = await hashUserPassword(input.password)
  const db = useDb()
  const [user] = await db
    .insert(schema.users)
    .values({ email, name, passwordHash, role })
    .returning()

  return toUserDto(user!)
}

export async function seedAdminIfNeeded() {
  const db = useDb()
  const [existing] = await db.select({ id: schema.users.id }).from(schema.users).limit(1)
  if (existing) return

  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD
  if (!email || !password) {
    console.warn('[CHAPEL] No users found and ADMIN_EMAIL/ADMIN_PASSWORD not set')
    return
  }

  const passwordHash = await hashUserPassword(password)
  await db.insert(schema.users).values({
    email: email.toLowerCase().trim(),
    passwordHash,
    name: 'Administrator',
    role: 'admin'
  })
  console.info(`[CHAPEL] Seeded admin user: ${email}`)
}

export async function seedDefaultServiceTypeIfNeeded() {
  await ensureDefaultServiceType()
}
