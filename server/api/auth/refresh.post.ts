import { and, eq, isNull } from 'drizzle-orm'
import { useDb, schema } from '../../database/client'
import { signAccessToken, generateRefreshToken, refreshTokenExpiryDate } from '../../utils/jwt'
import { loadUserPermissions } from '../../utils/permission'
import { AppUser } from '~/types/models'
import { ResponseEntity } from '~/types/common'

const COOKIE_BASE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}

export default defineEventHandler(async (event): Promise<ResponseEntity<AppUser>> => {
  const { public: publicConfig, accessTokenTtl, refreshTokenTtlDays } = useRuntimeConfig()

  const refreshToken = getCookie(event, publicConfig.refreshJwtKeyName)
  if (!refreshToken) {
    throw createError({ statusCode: 401, statusMessage: 'No refresh token found.' })
  }

  const db = useDb()

  //  Read the Refresh Token from the Cookie and compare it to the access_token table.
  const [session] = await db
    .select()
    .from(schema.accessToken)
    .where(and(eq(schema.accessToken.token, refreshToken), isNull(schema.accessToken.logoutedDate)))
    .limit(1)

  if (!session || session.revoked) {
    deleteCookie(event, publicConfig.jwtKeyName, { path: '/' })
    deleteCookie(event, publicConfig.refreshJwtKeyName, { path: '/' })
    throw createError({ statusCode: 401, statusMessage: 'The refresh token has been cancelled. Please log in again.' })
  }

  if (!session.expiresAt || session.expiresAt.getTime() < Date.now()) {
    deleteCookie(event, publicConfig.jwtKeyName, { path: '/' })
    deleteCookie(event, publicConfig.refreshJwtKeyName, { path: '/' })
    throw createError({ statusCode: 401, statusMessage: 'Your refresh token has expired. Please log in again.' })
  }

  if (!session.appUser) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid session.' })
  }

  const [user] = await db.select().from(schema.appUser).where(eq(schema.appUser.id, session.appUser)).limit(1)

  if (!user || !user.active || user.deleted) {
    throw createError({ statusCode: 403, statusMessage: 'This user account has been suspended.' })
  }

  // Rotation: Issue a new Refresh Token + update the existing row in the access_token table.
  const newRefreshToken = generateRefreshToken()
  await db
    .update(schema.accessToken)
    .set({
      token: newRefreshToken,
      expiresAt: refreshTokenExpiryDate(),
      lastestActive: new Date(),
    })
    .where(eq(schema.accessToken.id, session.id))

  // Always retrieve the latest permissions in case the role/permission is modified along the way.
  const { roles, permissions } = await loadUserPermissions(user.id)

  const newAccessToken = signAccessToken({
    sub: user.id.toString(),
  })

  const ttlString = String(accessTokenTtl || '15m')
  const minutes = Number(ttlString.replace(/[^0-9]/g, '')) || 15

  // setCookie(event, publicConfig.jwtKeyName, newAccessToken, COOKIE_BASE)
  setCookie(event, publicConfig.jwtKeyName, newAccessToken, {
    ...COOKIE_BASE,
    maxAge: minutes * 60
  })
  setCookie(event, publicConfig.refreshJwtKeyName, newRefreshToken, {
    ...COOKIE_BASE,
    maxAge: Number(refreshTokenTtlDays ?? 7) * 24 * 60 * 60,
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
