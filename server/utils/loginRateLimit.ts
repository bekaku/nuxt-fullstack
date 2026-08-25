/**
 * Simple in-memory rate limiting for login attempts.
 *
 * Tracks failed logins per identifier (email/username) + IP combination.
 * After MAX_ATTEMPTS failures within WINDOW_MS, further attempts are blocked
 * until the window expires. Counters are cleared on successful login.
 *
 * Uses Nitro's useStorage (memory driver) — swap to a Redis/DB-backed driver
 * for multi-instance deployments without changing this API.
 */

const WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const MAX_ATTEMPTS = 5

interface AttemptRecord {
  count: number
  windowStart: number
}

const storage = () => useStorage('login-rate-limit')

export const getLoginRateLimitKey = (identifier: string, ip: string): string =>
  `${identifier.toLowerCase()}|${ip}`

/** Returns seconds remaining until unblock, or 0 if not blocked. */
export async function isLoginBlocked(key: string): Promise<number> {
  const record = await storage().getItem<AttemptRecord>(key)
  if (!record) {
    return 0
  }
  const elapsed = Date.now() - record.windowStart
  if (elapsed > WINDOW_MS) {
    return 0
  }
  if (record.count < MAX_ATTEMPTS) {
    return 0
  }
  return Math.ceil((WINDOW_MS - elapsed) / 1000)
}

export async function recordLoginFailure(key: string): Promise<void> {
  const record = await storage().getItem<AttemptRecord>(key)
  if (!record || Date.now() - record.windowStart > WINDOW_MS) {
    await storage().setItem(key, { count: 1, windowStart: Date.now() } satisfies AttemptRecord)
    return
  }
  await storage().setItem(key, { count: record.count + 1, windowStart: record.windowStart } satisfies AttemptRecord)
}

export async function clearLoginFailures(key: string): Promise<void> {
  await storage().removeItem(key)
}
