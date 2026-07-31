import { verifyAccessToken } from '#server/utils/jwt'
import { schema, useDb } from '../database/client';
import { eq, and } from 'drizzle-orm'
/**
* Nitro Middleware intercepts all requests at /api/**
* - Reads the Access Token (JWT) from an HTTP-Only Cookie.
* - If valid -> pastes event.context.user and lets it pass.
* - If no cookie -> lets it pass as "anonymous" (the route itself decides whether login is required or not).
* Passes via requirePermission() / getAuthUser().
* - If a cookie exists but is invalid/expired -> clears the cookie and immediately returns a 401 error.
* To allow the client to continue calling /api/auth/refresh (see app/composables/useApi.ts).
*/
export default defineEventHandler(async (event) => {
  const path = (event.path || event.node.req.url || '').split('?')[0]

  if (!path) {
    return;
  }

  // No authentication is needed for endpoint login/refresh/logout (but /api/auth/me still requires authentication)
  const PUBLIC_PATHS = ['/api/auth/login', '/api/auth/refresh', '/api/auth/logout']
  if (PUBLIC_PATHS.includes(path)) { return }

  // It's not /api/* at all, it's irrelevant.
  if (!path.startsWith('/api/')) { return }
  const { public: publicConfig } = useRuntimeConfig()
  const token = getCookie(event, publicConfig.jwtKeyName)

  // case provided to mobile app too use header token
  // if (!token) {
  //   // Retrieve the 'Authorization' header value (H3 is automatically case-sensitive, but it's okay to check for accuracy).
  //   const authHeader = getHeader(event, 'authorization');
  //   // Check if there is a header that starts with the word 'Bearer'.
  //   if (authHeader && authHeader.startsWith('Bearer ')) {
  //     // Remove the word 'Bearer' (7 letters) to leave only JWT.
  //     token = authHeader.substring(7);
  //   }
  // }
  if (!token) { return } // anonymous — Let the destination route decide for itself.

  //get refresh token
  const refreshToken = getCookie(event, publicConfig.refreshJwtKeyName)

  try {
    const payload = verifyAccessToken(token)
    if (payload.sub) {
      if (!refreshToken) {
        // If an Access Token is present but there is no Refresh Token, this is abnormal and the user should be removed.
        throw new Error('Refresh token missing from cookie')
      }
      const db = useDb()
      // Search in the accessToken table (referencing the field names you previously submitted)
      const [existingSession] = await db
        .select({ id: schema.accessToken.id })
        .from(schema.accessToken)
        .where(
          and(
            eq(schema.accessToken.appUser, BigInt(payload.sub)), // Matches the User
            eq(schema.accessToken.token, refreshToken),          // This matches the Refresh Token of this device.
            eq(schema.accessToken.revoked, false)                // Not suspended.
          )
        )
        .limit(1)
      // If it can't be found (deleted during password change) or has been revoked.
      if (!existingSession) {
        throw new Error('Session revoked or not found in database')
      }
    }
    event.context.user = payload
  } catch {
    deleteCookie(event, publicConfig.jwtKeyName)
    if (refreshToken) {
      deleteCookie(event, publicConfig.refreshJwtKeyName)
    }
    throw createError({ statusCode: 401, statusMessage: 'Access token expired or invalid' })
  }
})
