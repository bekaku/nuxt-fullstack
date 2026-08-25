export const serverException = (error: any, statusCode: number = 500) => {
  // Only forward developer-authored messages (plain objects with an explicit
  // statusMessage/message). Raw Error instances (e.g. Postgres driver errors)
  // must not leak internals to clients — log them server-side and return a
  // generic message instead.
  const isAuthored = !(error instanceof Error)
  if (!isAuthored) {
    console.error('[serverException]', error)
  }
  return createError({
    statusCode: error?.statusCode || statusCode,
    statusMessage: isAuthored
      ? (error.statusMessage || error.message || 'Internal Server Error')
      : 'Internal Server Error'
  })
}
