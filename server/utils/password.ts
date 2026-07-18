import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

export async function hashPassword(plain: string): Promise<{ hash: string; salt: string }> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS)
  const hash = await bcrypt.hash(plain, salt)
  return { hash, salt }
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}
