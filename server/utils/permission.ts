import { eq, and } from 'drizzle-orm'
import { useDb, schema } from '#server/database/client'
import type { H3Event } from 'h3'
import { AccessTokenPayload } from '~/types/common'
/**
* Retrieve all user permissions from app_user -> app_user_role -> role_permission -> permission
* Use during login/refresh to embed the permission code into the JWT payload
* (As per the recommendation in Phase 4.2: Embed permissions into the JWT instead of querying every request)
*/
export async function loadUserPermissions(userId: bigint) {
  const db = useDb()

  const rows = await db
    .select({
      roleId: schema.appRole.id,
      roleName: schema.appRole.name,
      permissionCode: schema.permission.code,
    })
    .from(schema.appUserRole)
    .innerJoin(schema.appRole, eq(schema.appUserRole.appRole, schema.appRole.id))
    .leftJoin(schema.rolePermission, eq(schema.rolePermission.appRole, schema.appRole.id))
    .leftJoin(schema.permission, eq(schema.permission.id, schema.rolePermission.permission))
    .where(eq(schema.appUserRole.appUser, userId))

  const roles = new Set<string>()
  const permissions = new Set<string>()

  for (const row of rows) {
    if (row.roleName) roles.add(row.roleId.toString())
    if (row.permissionCode) permissions.add(row.permissionCode)
  }

  return { roles: [...roles], permissions: [...permissions] }
}

/** Read the current user's information pasted into the event.context file at server/middleware/00.auth.ts */
export function getAuthUser(event: H3Event): AccessTokenPayload {
  const user = event.context.user as AccessTokenPayload | undefined
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  return user
}


export async function isHasPermission(userId: bigint, code: string): Promise<boolean> {
  const db = useDb()
  const result = await db.select({
    code: schema.permission.code
  })
    .from(schema.appUserRole)
    .innerJoin(
      schema.rolePermission,
      eq(schema.appUserRole.appRole, schema.rolePermission.appRole)
    )
    .innerJoin(
      schema.permission,
      eq(schema.rolePermission.permission, schema.permission.id)
    )
    .where(
      and(
        eq(schema.appUserRole.appUser, userId),
        eq(schema.permission.code, code)
      )
    ).limit(1);
  return result.length > 0
}

/**
* Route Validation Logic (Phase 4.3)
* Throws a 403 if the current user does not have the required permission code.
* Used in all API routes that require permission restrictions, e.g., requirePermission(event, 'app_user_add')
*/
export async function requirePermission(event: H3Event, code: string): Promise<AccessTokenPayload> {
  const user = getAuthUser(event)
  const hasPermission = await isHasPermission(user.sub as any, code)
  if (!hasPermission) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      data: { requiredPermission: code },
    })
  }
  return user
}


/** Similar to requirePermission, but it works if you have one of the permissions on the list */
export async function requireAnyPermission(event: H3Event, codes: string[]): Promise<AccessTokenPayload> {
  const user = getAuthUser(event)
  let ok = false;
  for (const code of codes) {
    const hasPermission = await isHasPermission(user.sub as any, code)
    if (hasPermission) {
      ok = true
      break
    }
  }
  if (!ok) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      data: { requiredPermission: codes.toString() },
    })
  }
  return user
}
export async function requireAllPermission(event: H3Event, codes: string[]): Promise<AccessTokenPayload> {
  const user = getAuthUser(event)
  let ok = true;
  for (const code of codes) {
    const hasPermission = await isHasPermission(user.sub as any, code)
    if (!hasPermission) {
      ok = false
      break
    }
  }
  if (!ok) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
       data: { requiredPermission: codes.toString() },
    })
  }
  return user
}
