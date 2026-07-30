import type { H3Event } from 'h3'
export const validateID = (event: H3Event): string => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Permission ID is required'
    })
  }

  return id;
}
