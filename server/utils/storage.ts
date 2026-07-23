import fs from 'node:fs/promises'
import path from 'node:path'

export const deleteFileFromStorage = async (dbFilePath: string) => {
  const config = useRuntimeConfig()
  const cdnDirectory = config.cdnDirectory
  try {
    // 1. สร้าง Path จริงของไฟล์
    // process.cwd() คือตำแหน่ง root ของโปรเจกต์
    // จะได้ผลลัพธ์ประมาณ: /your-project-path/upload/202607/336427155128848384_338560565448282112.jpg
    const absolutePath = path.join(process.cwd(), cdnDirectory, dbFilePath)

    await fs.unlink(absolutePath)

    console.log(`[Storage] Deleted successfully: ${absolutePath}`)
    return true
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.warn(`[Storage] File not found (might be already deleted): ${dbFilePath}`)
      return true;
    }

    console.error(`[Storage] Failed to delete file:`, error)
    throw error
  }
}
