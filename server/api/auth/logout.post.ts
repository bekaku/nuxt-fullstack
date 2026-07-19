import { eq } from 'drizzle-orm'
import { useDb, schema } from '../../database/client'
import { ResponseEntity } from '~/types/common'

export default defineEventHandler(async (event): Promise<ResponseEntity<void>> => {
  const refreshToken = getCookie(event, 'refresh_token')

  if (refreshToken) {
    const db = useDb()
    await db
      .update(schema.accessToken)
      .set({ revoked: true, logoutedDate: new Date() })
      .where(eq(schema.accessToken.token, refreshToken))
  }

  deleteCookie(event, 'access_token', { path: '/' })
  deleteCookie(event, 'refresh_token', { path: '/' })

   return {
    status: 200,
    message: 'Logout successful'
  }
})
