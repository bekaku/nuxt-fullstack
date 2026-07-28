import { getRouterParam, createError } from 'h3'
import { eq } from 'drizzle-orm'
import { schema, useDb } from '~~/server/database/client'
import { ResponseEntity } from '~/types/common'

export default defineEventHandler(async (event): Promise<ResponseEntity<void>> => {

  await requirePermission(event, 'permission_delete')

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Permission ID is required'
    })
  }

  const db = useDb()

  try {
    // ต้องลบข้อมูลที่ผูกอยู่ใน role_permission ก่อนเพื่อไม่ให้ติด Foreign Key Constraint
    await db.delete(schema.rolePermission).where(eq(schema.rolePermission.permission, BigInt(id)))

    // ลบข้อมูล Permission หลัก
    await db.delete(schema.permission).where(eq(schema.permission.id, BigInt(id)))

    return {
      status: 200,
      message: 'Permission deleted successfully',
    }

  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error'
    })
  }
})
