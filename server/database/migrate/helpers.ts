export const escapeSql = (val: any): string => {
  if (val === null || val === undefined) return 'NULL'
  if (typeof val === 'boolean') return val ? 'true' : 'false'
  if (typeof val === 'number') return val.toString()
  if (val instanceof Date) {
    // Convert Date to format 'YYYY-MM-DD HH:mm:ss' for Postgres
    const iso = val.toISOString().replace('T', ' ').split('.')[0]
    return `'${iso}'`
  }
  if (typeof val === 'string') {
    // Escape single quote (') to ('') according to SQL rules.
    return `'${val.replace(/'/g, "''")}'`
  }
  return `'${val}'`
}

// 2. Helper Function: Convert Buffer (BIT) to Boolean
export const bitToBool = (bufferVal: Buffer | null): boolean => {
  if (!bufferVal) return false
  return bufferVal[0] === 1
}

// 3. Helper Function: Convert Date to String 'YYYY-MM-DD' (for Drizzle PG type 'date')
export const toDateString = (dateVal: Date | null): string | null | undefined => {
  if (!dateVal) return null
  // แปลงให้เป็น Format มาตรฐานที่ PG ต้องการ
  return new Date(dateVal).toISOString().split('T')[0]
}
