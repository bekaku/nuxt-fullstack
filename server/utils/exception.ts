export const serverException = (error: any, statusCode: number = 500) => {
  return createError({
    statusCode: error.statusCode || statusCode,
    statusMessage: error.message || error.statusMessage || 'Internal Server Error'
  })
}
