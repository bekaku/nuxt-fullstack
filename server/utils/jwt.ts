import jwt from 'jsonwebtoken'
import { AccessTokenPayload } from '~/types/common'
import { v7 as uuidv7 } from 'uuid';
/**
* Access Token = stateless JWT, short expiry date (default 15 minutes)
* Not saved to DB — verified only with signature + experience
*/
export function signAccessToken(payload: AccessTokenPayload): string {
  const config = useRuntimeConfig()
  if (!config.jwtAccessSecret) {
    throw new Error('JWT_ACCESS_SECRET is not set')
  }
  return jwt.sign(payload, config.jwtAccessSecret, {
    expiresIn: config.accessTokenTtl as jwt.SignOptions['expiresIn'],
  })
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const config = useRuntimeConfig()
  if (!config.jwtAccessSecret) {
    throw new Error('JWT_ACCESS_SECRET is not set')
  }
  return jwt.verify(token, config.jwtAccessSecret) as unknown as AccessTokenPayload
}

/**
* Refresh Token = opaque random string (not JWT) stored in the access_token table
* to enable revoke/rotate on the server side
*/
export function generateRefreshToken(): string {
  // return crypto.randomUUID()
  return uuidv7();
}

export function refreshTokenExpiryDate(): Date {
  const config = useRuntimeConfig()
  const days = Number(config.refreshTokenTtlDays ?? 7)
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000)
}
