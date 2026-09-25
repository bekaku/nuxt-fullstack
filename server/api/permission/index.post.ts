import { eq, and, ne } from 'drizzle-orm'
import { schema, useDb } from '~~/server/database/client'
import { z } from 'zod'
import type { ResponseEntity } from '~/types/common'
import type { Permission } from '~/types/models'
import { serverException } from '~~/server/utils/exception'

// ใช้ z.enum() เพื่อ Validate ค่าให้ตรงกับ Type PermissionType
const bodySchema = z.object({
  id: z.string().regex(/^\d+$/).nullish(),
  code: z.string().min(1, 'Code is required'),
  description: z.string().nullish(),
  module: z.string().nullish(),
  operationType: z.enum(['CRUD', 'REPORT', 'OTHER', 'FEATURE']).optional(),
})

export default defineEventHandler(async (event): Promise<ResponseEntity<Permission>> => {

  await requireAnyPermission(event, ['permission_add', 'permission_edit'])

  const body = await readValidatedBody(event, bodySchema.parse)
  // Create needs *_add, update needs *_edit (the any-check above is only a cheap first gate).
  await requirePermission(event, body.id ? 'permission_edit' : 'permission_add')

  const { id, code, module, description, operationType } = body

  const db = useDb()

  try {
    const result = await db.transaction(async (tx) => {

      // 1. เช็ค code ซ้ำ (เหมือนตอนเช็ค name ของ Role)
      const codeCheckConditions = id
        ? and(eq(schema.permission.code, code), ne(schema.permission.id, BigInt(id)))
        : eq(schema.permission.code, code);

      const existingPermission = await tx.query.permission.findFirst({
        where: codeCheckConditions,
        columns: { id: true }
      });

      if (existingPermission) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Permission code already exists'
        })
      }

      let currentPermissionId: bigint | null;

      // 2. บันทึกข้อมูล
      if (id) {
        // Mode: Update
        currentPermissionId = BigInt(id);
        const [updated] = await tx
          .update(schema.permission)
          .set({
            code,
            module,
            description,
            operationType
          })
          .where(eq(schema.permission.id, currentPermissionId))
          .returning({ id: schema.permission.id });

        if (!updated) {
          throw createError({ statusCode: 404, statusMessage: 'Permission not found' })
        }

      } else {
        // Mode: Insert
        const [newPermission] = await tx
          .insert(schema.permission)
          .values({
            code,
            module,
            description,
            operationType
          })
          .returning({ id: schema.permission.id });

        currentPermissionId = newPermission ? newPermission.id : null;
      }

      return {
        id: currentPermissionId?.toString() as string,
        code,
        module,
        description,
        operationType: operationType as any // แคสต์ให้ตรงกับ Type ใน Interface
      };
    })

    return {
      status: 200,
      data: result
    }

  } catch (error: any) {
    // Re-throw authored errors (400/404/409); hide driver errors behind a generic 500.
    if (error?.statusCode) throw error;
    throw serverException(error)
  }
})
