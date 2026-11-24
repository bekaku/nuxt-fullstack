import type { RequestEvent } from 'nuxt/server'

const NUMERIC_ID = /^\d{1,20}$/

/** True when the value can be safely passed to BigInt() as a Snowflake id. */
export const isNumericId = (value: unknown): value is string =>
  typeof value === 'string' && NUMERIC_ID.test(value)

/** Validate a numeric id taken from anywhere (query, body, param); 400 when invalid. */
export const assertNumericId = (value: unknown, name = 'ID'): string => {
  if (!isNumericId(value)) {
    throw createError({
      statusCode: 400,
      statusMessage: `${name} is required and must be numeric`
    })
  }
  return value
}

export const validateID = (event: RequestEvent): string => {
  return assertNumericId(getRouterParam(event, 'id'))
}
