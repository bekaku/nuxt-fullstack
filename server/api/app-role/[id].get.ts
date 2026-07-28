import { getRouterParam, createError } from 'h3'
import { eq } from 'drizzle-orm'
import { schema, useDb } from '~~/server/database/client'
import { ResponseEntity } from '~/types/common'
import { AppRole } from '~/types/models'
// อย่าลืม import schema และ useDb ตามโครงสร้างโปรเจกต์ของคุณ

export default defineEventHandler(async (event): Promise<ResponseEntity<AppRole>> => {

  await requirePermission(event, 'app_role_view')
  // 1. ดึงค่า ID จาก URL
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Role ID is required'
    })
  }

  const db = useDb()

  try {
    const role = await db.query.appRole.findFirst({
      where: eq(schema.appRole.id, BigInt(id)),
      columns: {
        id: true,
        name: true,
        active: true,
      },
      with: {
        rolePermissions: {
          columns: { permission: true }
        }
      }
    })

    // ถ้าไม่พบข้อมูลให้พ่น Error 404
    if (!role) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Role not found'
      })
    }

    return {
      status: 200,
      data: {
        id: role.id,
        name: role.name,
        active: role.active || false,
        selectdPermissions: role.rolePermissions.map(rp => rp.permission.toString())
      }
    }

  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error'
    })
  }
})
