import type { RequestEvent } from 'nuxt/server'

/**
* Guard for developer/test endpoints under server/api/test/: they do not exist in
* production builds (404) and, in dev, still require an admin-level permission.
*/
export async function requireDevEndpoint(event: RequestEvent, permissionCode = 'app_user_add') {
  if (!import.meta.dev) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }
  return requirePermission(event, permissionCode)
}
