import { schema, useDb } from '#server/database/client'
import { and, eq, ne } from 'drizzle-orm'
import { z } from 'zod'
import { ResponseEntity } from '~/types/common'

const bodySchema = z.object({
  password: z.string().min(8),
  newPassword: z.string().min(8),
  logoutAllDevices: z.boolean().nullish(),
}).refine((data) => data.password !== data.newPassword, {
  message: "The new password must be different from the old password.",
  path: ["newPassword"],
})

export default defineEventHandler(async (event): Promise<ResponseEntity<void>> => {
  const body = await readValidatedBody(event, bodySchema.parse)
  const db = useDb()

  const auth = getAuthUser(event)
  if (!auth.sub) {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized.' })
  }

  // Check if the user exists and is valid
  const [existUser] = await db
    .select({
      id: schema.appUser.id,
      password: schema.appUser.password,
      deleted: schema.appUser.deleted
    })
    .from(schema.appUser)
    .where(eq(schema.appUser.id, BigInt(auth.sub)))
    .limit(1)

  if (!existUser || existUser.deleted || !existUser.password) {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized or account disabled.' })
  }

  // Validate current password
  const validPassword = await verifyPassword(body.password, existUser.password)
  if (!validPassword) {
    throw createError({ statusCode: 403, statusMessage: 'The password is incorrect.' })
  }

  // Update password
  const { hash } = await hashPassword(body.newPassword)
  const updateData = {
    password: hash,
    updatedUser: BigInt(auth.sub)
  }

  const [updated] = await db
    .update(schema.appUser)
    .set(updateData)
    .where(eq(schema.appUser.id, BigInt(auth.sub)))
    .returning({
      id: schema.appUser.id,
    })

  if (!updated) {
    throw createError({ statusCode: 500, statusMessage: 'Data saving failed.' })
  }

  // Revoke sessions: a password change must invalidate existing sessions,
  // otherwise a stolen session survives the new password indefinitely.
  const { public: publicConfig } = useRuntimeConfig()
  const currentRefreshToken = getCookie(event, publicConfig.refreshJwtKeyName)

  if (body.logoutAllDevices === true || !currentRefreshToken) {
    // Revoke every session for this user.
    await db
      .delete(schema.accessToken)
      .where(eq(schema.accessToken.appUser, BigInt(auth.sub)));
  } else {
    // Revoke all other devices but keep the current session alive
    // (the auth middleware requires this row to exist for requests to pass).
    await db
      .delete(schema.accessToken)
      .where(and(
        eq(schema.accessToken.appUser, BigInt(auth.sub)),
        ne(schema.accessToken.token, currentRefreshToken)
      ));
  }

  return {
    status: 200,
  }
})
