import { createError } from 'h3'
import { ResponseEntity } from '~/types/common'
import { AppUser } from '~/types/models'
import { schema, useDb } from '~~/server/database/client'
import { validateID } from '~~/server/utils/validate'

import { eq, and } from 'drizzle-orm'
import { serverException } from '~~/server/utils/exception'

export default defineEventHandler(async (event): Promise<ResponseEntity<void>> => {
  await requirePermission(event, 'app_user_delete')
  const id = validateID(event)

  const db = useDb()
  let [data] = await db
    .select()
    .from(schema.appUser)
    .where(and(eq(schema.appUser.id, BigInt(id)), eq(schema.appUser.deleted, false)))
    .limit(1)

  if (!data) {
    throw serverException({
      statusCode: 404,
      statusMessage: 'Data not found'
    })
  }

  //soft delete
  try {
    await db
      .update(schema.appUser)
      .set({
        deleted: true
      })
      .where(eq(schema.appUser.id, BigInt(id)))
      .returning({
        id: schema.appUser.id,
      })
  } catch (error: any) {
    throw serverException(error)
  }
  return {
    status: 200,
  }
})
