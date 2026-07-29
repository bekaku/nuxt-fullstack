import { readBody, createError } from 'h3'
import { eq, and, ne } from 'drizzle-orm'
import { schema, useDb } from '~~/server/database/client'
import { z } from 'zod'
import { ResponseEntity } from '~/types/common'
import { AppRole } from '~/types/models'


const bodySchema = z.object({
  name: z.string().min(1),
  id: z.string().optional(),
  active: z.boolean().optional(),
  selectdPermissions: z.array(z.string()).optional(),
})

export default defineEventHandler(async (event): Promise<ResponseEntity<AppRole>>  => {

  await requireAnyPermission(event, ['app_role_add', 'app_role_edit'])
  const body = await readValidatedBody(event, bodySchema.parse)
  const { id, name, active, selectdPermissions } = body

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Role name is required'
    })
  }

  const auth = getAuthUser(event)

  const db = useDb()

  try {
    // Using Transactions: If anything breaks, all data will be rolled back.
    const result = await db.transaction(async (tx) => {

      // 3. Save the data to the app_role table.
      const nameCheckConditions = id
        ? and(eq(schema.appRole.name, name), ne(schema.appRole.id, BigInt(id)))
        : eq(schema.appRole.name, name);

      const existingRole = await tx.query.appRole.findFirst({
        where: nameCheckConditions,
        columns: { id: true }
      });

      if (existingRole) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Role name already exists'
        })
      }

      let currentRoleId: bigint | null;

      // 3. Save the data to the app_role table.
      if (id) {
        //Mode: Update existing data
        currentRoleId = BigInt(id);
        await tx
          .update(schema.appRole)
          .set({ name, active, updatedUser: BigInt(auth.sub) })
          .where(eq(schema.appRole.id, currentRoleId));

        // Clear all existing permissions first to prepare for installing new ones.
        await tx
          .delete(schema.rolePermission)
          .where(eq(schema.rolePermission.appRole, currentRoleId));

      } else {
        // Mode: Create new data
        const [newRole] = await tx
          .insert(schema.appRole)
          .values({
            name,
            active,
            createdUser: BigInt(auth.sub),
            updatedUser: BigInt(auth.sub)
          })
          .returning({ id: schema.appRole.id }); // Have PostgreSQL return the newly created ID.

        currentRoleId = newRole ? newRole.id : null;
      }

      // 4. Save the data to the role_permission table.
      if (currentRoleId && selectdPermissions && selectdPermissions.length > 0) {
        // Format the data as an array of objects for bulk insertion.
        const permissionData = selectdPermissions.map((permissionId: string) => ({
          appRole: currentRoleId,
          permission: BigInt(permissionId)
        }));

        await tx.insert(schema.rolePermission).values(permissionData);
      }

      return {
        id: currentRoleId?.toString(),
        name,
        active,
        selectdPermissions
      };
    })

    return {
      status: 200,
      data: {
        ...result,
        selectdPermissions: result.selectdPermissions || [],
        active: result.active || false
      }
    }

  } catch (error: any) {
    if (error.statusCode) throw error;

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Internal Server Error'
    })
  }
})
