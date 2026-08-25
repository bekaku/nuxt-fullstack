import { z } from 'zod'
import { eq, or } from 'drizzle-orm'
import { useDb, schema } from '../../database/client'
import { verifyPassword } from '../../utils/password'
import { signAccessToken, generateRefreshToken, refreshTokenExpiryDate } from '../../utils/jwt'
import { loadUserPermissions } from '../../utils/permission'
import { nextId } from '../../utils/snowflake'
import { AppUser } from '~/types/models'
import { ResponseEntity } from '~/types/common'
import { clearLoginFailures, getLoginRateLimitKey, isLoginBlocked, recordLoginFailure } from '~~/server/utils/loginRateLimit'

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

// Precomputed bcrypt hash (cost must match SALT_ROUNDS) of a random secret.
// Compared against when the account doesn't exist so that response timing
// is identical for existing and non-existing accounts (timing oracle).
const DUMMY_HASH = '$2b$10$pDALgPSVnA5bIFvC/nP7m.WESnazkjUqx/RL0zlPhBESeo0C9oXxy'

// Same generic message for every failure — never reveal whether the account
// exists, is deleted, or is suspended (account enumeration).
const GENERIC_LOGIN_ERROR = 'The email address/username or password is incorrect.'

export default defineEventHandler(async (event): Promise<ResponseEntity<AppUser>> => {

  const body = await readValidatedBody(event, bodySchema.parse)
  const db = useDb()

  // --- Rate limiting: block after repeated failures per identifier+IP ---
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  const rateLimitKey = getLoginRateLimitKey(body.emailOrUsername, ip)
  const blockedForSeconds = await isLoginBlocked(rateLimitKey)
  if (blockedForSeconds > 0) {
    setResponseHeader(event, 'retry-after', blockedForSeconds)
    throw createError({ statusCode: 429, statusMessage: 'Too many failed login attempts. Please try again later.' })
  }

  const [user] = await db
    .select()
    .from(schema.appUser)
    .where(or(eq(schema.appUser.email, body.emailOrUsername), eq(schema.appUser.username, body.emailOrUsername)))
    .limit(1)

  // Always run bcrypt (dummy hash when the user doesn't exist) to equalize timing.
  const validPassword = await verifyPassword(body.password, user?.password ?? DUMMY_HASH)
  if (!user || !user.password || !validPassword || user.deleted || !user.active) {
    await recordLoginFailure(rateLimitKey)
    throw createError({ statusCode: 403, statusMessage: GENERIC_LOGIN_ERROR })
  }

  await clearLoginFailures(rateLimitKey)

  const { roles, permissions } = await loadUserPermissions(user.id)

  // Record device/IP addresses to user_agent and login_log.
  const uaString = getHeader(event, 'user-agent') ?? 'unknown'

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

  const { public: publicConfig, accessTokenTtl, refreshTokenDays } = useRuntimeConfig()
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

  const ttlString = String(accessTokenTtl || '15m')
  const minutes = Number(ttlString.replace(/[^0-9]/g, '')) || 15
  // setCookie(event, 'access_token', accessToken, COOKIE_BASE)
  setCookie(event, publicConfig.jwtKeyName, accessToken, {
    ...COOKIE_BASE,
    maxAge: minutes * 60
  })
  setCookie(event, publicConfig.refreshJwtKeyName, refreshToken, {
    ...COOKIE_BASE,
    maxAge: Number(refreshTokenDays ?? 7) * 24 * 60 * 60,
  })
  return {
    status: 200,
    data: {
      id: user.id.toString(),
      email: user.email,
      username: user.username,
      selectedRoles: roles,
      permissions,
    }
  }

})
