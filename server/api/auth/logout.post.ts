import { eq } from 'drizzle-orm'
import { useDb, schema } from '../../database/client'
import { ResponseEntity } from '~/types/common'

export default defineEventHandler(async (event): Promise<ResponseEntity<void>> => {

   const { public: publicConfig } = useRuntimeConfig()
  const refreshToken = getCookie(event, publicConfig.refreshJwtKeyName)

  if (refreshToken) {
    const db = useDb()
    await db
      .update(schema.accessToken)
      .set({ revoked: true, logoutedDate: new Date() })
      .where(eq(schema.accessToken.token, refreshToken))
  }


  deleteCookie(event, publicConfig.jwtKeyName, { path: '/' })
  deleteCookie(event, publicConfig.refreshJwtKeyName, { path: '/' })

   return {
    status: 200,
    message: 'Logout successful'
  }
})
