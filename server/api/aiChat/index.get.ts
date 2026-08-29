import { schema, useDb } from '#server/database/client'
import { and, count, eq } from 'drizzle-orm'
import { ApiResponse, ResponseEntity } from "~/types/common"
import { AiChat, AiChatMessage } from "~/types/models"
import { paginate } from '~~/server/utils/dbPaging'

export default defineEventHandler(async (event): Promise<ResponseEntity<ApiResponse<AiChatMessage>>> => {
  const auth = getAuthUser(event)
  if (!auth) {
    // เปลี่ยนจาก 403 เป็น 401 (Unauthenticated) เพื่อความถูกต้องทาง Semantic
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized.' })
  }

  const db = useDb()

  const dataQuery = db
    .select({
      id: schema.aiChat.id,
      title: schema.aiChat.title,
      updatedDate: schema.aiChat.updatedDate,
      pin: schema.aiChat.pin,
    })
    .from(schema.aiChat)
    .$dynamic()

  const countQuery = db
    .select({ value: count() })
    .from(schema.aiChat)
    .$dynamic()

  const data = await paginate(event, {
    dataQuery,
    countQuery,
    columns: {
      id: schema.aiChat.id,
      title: schema.aiChat.title,
    },
    where: and(
      eq(schema.aiChat.createdUser, BigInt(auth.sub)),
    ),
    defaultSort: schema.aiChat.updatedDate,
    defaultSortDirection: 'desc'
  })

  return {
    status: 200,
    data
  }
})
