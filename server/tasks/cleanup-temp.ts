import fs from 'node:fs/promises'
import path from 'node:path'

export default defineTask({
  meta: {
    name: 'cleanup-temp',
    description: 'Delete chunky, leftover files in the temp folder that have been there for over 24 hours.'
  },
  async run() {
    console.log('🧹 Cleaning up temp folder...')
    const config = useRuntimeConfig()
    // Retrieve the temp folder path the same way as during the upload.
    const uploadDir = path.join(process.cwd(), config.cdnDirectory)
    const tempDir = path.join(uploadDir, 'temp')

    // Set the lifespan of junk files (24 hours = 24 * 60 * 60 * 1000 ms)
    const MAX_AGE_MS = 24 * 60 * 60 * 1000
    const now = Date.now()
    let deletedCount = 0

    try {
      // 1. Read the list of all files in the temp folder.
      const files = await fs.readdir(tempDir)

    // 2. Loop through and check each file one by one.
      for (const file of files) {
        const filePath = path.join(tempDir, file)

        try {
          // Retrieving File Stats data to view the last modified time.
          const stats = await fs.stat(filePath)

          // Check if the file is actually a "file" and if it's overdue.
          if (stats.isFile() && (now - stats.mtimeMs > MAX_AGE_MS)) {
            await fs.unlink(filePath)
            deletedCount++
            console.log(`[Cleanup] Deleted orphaned file: ${file}`)
          }
        } catch (fileErr) {
         // Catch errors on a file-by-file basis in case a file is deleted during the loop.
          console.error(`[Cleanup] Failed to stat/delete file ${file}:`, fileErr)
        }
      }

      return { result: 'Success', deletedFiles: deletedCount }
    } catch (error: any) {
      // Catch errors if a temp folder doesn't exist.
      if (error.code === 'ENOENT') {
        return { result: 'Skipped', message: 'Temp directory does not exist yet' }
      }
      console.error('[Cleanup] Fatal error:', error)
      return { result: 'Error', message: error.message }
    }
  }
})
