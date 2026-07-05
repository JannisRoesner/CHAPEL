import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'

import { useDb, schema } from '../database'

import type { SessionUser } from '#shared/types/chapel'

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
