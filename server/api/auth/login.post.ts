import { z } from 'zod'
import { eq, or } from 'drizzle-orm'
import { useDb, schema } from '../../database/client'
import { verifyPassword } from '../../utils/password'
import { signAccessToken, generateRefreshToken, refreshTokenExpiryDate } from '../../utils/jwt'
import { loadUserPermissions } from '../../utils/permission'
import { nextId } from '../../utils/snowflake'
import { AppUser } from '~/types/models'

const bodySchema = z.object({
  emailOrUsername: z.string().min(1),
  password: z.string().min(1),
  // Mobile's fcm token (optional) — for future push notification support.
  fcmToken: z.string().optional(),
})

const COOKIE_BASE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}

export default defineEventHandler(async (event): Promise<AppUser> => {


  const body = await readValidatedBody(event, bodySchema.parse)
  const db = useDb()

  const [user] = await db
    .select()
    .from(schema.appUser)
    .where(or(eq(schema.appUser.email, body.emailOrUsername), eq(schema.appUser.username, body.emailOrUsername)))
    .limit(1)

  if (!user || !user.password || user.deleted) {
    throw createError({ statusCode: 401, statusMessage: 'The email address/username or password is incorrect.' })
  }

  if (!user.active) {
    throw createError({ statusCode: 403, statusMessage: 'This user account has been suspended.' })
  }

  const validPassword = await verifyPassword(body.password, user.password)
  if (!validPassword) {
    throw createError({ statusCode: 401, statusMessage: 'The email address/username or password is incorrect.' })
  }

  const { roles, permissions } = await loadUserPermissions(user.id)

  // Record device/IP addresses to user_agent and login_log.
  const uaString = getHeader(event, 'user-agent') ?? 'unknown'
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'

  let [userAgentRow] = await db
    .select()
    .from(schema.userAgent)
    .where(eq(schema.userAgent.agent, uaString))
    .limit(1)

  if (!userAgentRow) {
    ;[userAgentRow] = await db
      .insert(schema.userAgent)
      .values({ id: nextId(), agent: uaString })
      .returning()
  }

  const [loginLogRow] = await db
    .insert(schema.loginLog)
    .values({
      id: nextId(),
      createdAt: new Date(),
      hostName: getHeader(event, 'host') ?? null,
      ip,
      loginFrom: 0, // 0 = web
      appUser: user.id,
      userAgent: userAgentRow ? userAgentRow.id : null,
    })
    .returning()

  // Create a Refresh Token (opaque) and save it to the access_token table.
  const refreshToken = generateRefreshToken()
  await db.insert(schema.accessToken).values({
    id: nextId(),
    createdDate: new Date(),
    expiresAt: refreshTokenExpiryDate(),
    lastestActive: new Date(),
    revoked: false,
    service: 0, // 0 = web
    token: refreshToken,
    fcmEnable: !!body.fcmToken,
    fcmToken: body.fcmToken ?? null,
    appUser: user.id,
    loginLog: loginLogRow ? loginLogRow.id : null,
  })

  // Create an Access Token (JWT, stateless, short-lived)
  const accessToken = signAccessToken({
    sub: user.id.toString(),
  })

  const config = useRuntimeConfig()
  const ttlString = String(config.accessTokenTtl || '15m')
  const minutes = Number(ttlString.replace(/[^0-9]/g, '')) || 15
  // setCookie(event, 'access_token', accessToken, COOKIE_BASE)
  setCookie(event, 'access_token', accessToken, {
    ...COOKIE_BASE,
    maxAge: minutes * 60
  })
  setCookie(event, 'refresh_token', refreshToken, {
    ...COOKIE_BASE,
    maxAge: Number(config.refreshTokenDays ?? 7) * 24 * 60 * 60,
  })

  return {
    id: user.id.toString(),
    email: user.email,
    username: user.username,
    selectedRoles: roles,
    permissions,
  }
})
