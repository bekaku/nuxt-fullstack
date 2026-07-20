import { verifyAccessToken } from '#server/utils/jwt'

/**
* Nitro Middleware intercepts all requests at /api/**
* - Reads the Access Token (JWT) from an HTTP-Only Cookie.
* - If valid -> pastes event.context.user and lets it pass.
* - If no cookie -> lets it pass as "anonymous" (the route itself decides whether login is required or not).
* Passes via requirePermission() / getAuthUser().
* - If a cookie exists but is invalid/expired -> clears the cookie and immediately returns a 401 error.
* To allow the client to continue calling /api/auth/refresh (see app/composables/useApi.ts).
*/
export default defineEventHandler((event) => {
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

  try {
    const payload = verifyAccessToken(token)
    event.context.user = payload
  } catch {
    deleteCookie(event, publicConfig.jwtKeyName)
    throw createError({ statusCode: 401, statusMessage: 'Access token expired or invalid' })
  }
})
