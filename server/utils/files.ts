import { FileManager } from "~/types/models";
import { schema, useDb } from "../database/client"
import { aliasedTable, eq, getTableColumns, sql } from 'drizzle-orm'
import { mapToFileManager } from "./modelMapper";
import { getFileMimeType } from ".";
import { alias } from "drizzle-orm/pg-core";

export const loadFilemanager = async (id: bigint): Promise<FileManager | null> => {
  if (!id || isNaN(Number(id))) {
    return null;
  }
  const db = useDb()

  const config = useRuntimeConfig()
  /* Normal Query
  const fileManagerCols = getTableColumns(schema.fileManager);
  const thumbnailTable = alias(schema.fileManager, 'thumbnail_table');

  const data = await db
    .select({
      fileRecord: fileManagerCols,
      fileMimeName: schema.fileMime.name,
      thumbnailPath: thumbnailTable.filePath,
    })
    .from(schema.fileManager)
    .leftJoin(
      schema.fileMime,
      eq(schema.fileManager.fileMimeId, schema.fileMime.id)
    )
    .leftJoin(
      thumbnailTable,
      eq(schema.fileManager.thumbnailFile, thumbnailTable.id)
    )
    .where(eq(schema.fileManager.id, BigInt(id)))
    .limit(1);

  const row = data[0];

  if (!row) {
    // throw createError({ statusCode: 404, message: 'File not found' });
    return null;
  }

  const result: FileManager = mapToFileManager(row.fileRecord, {
    cdnBase: config.public.cdnBase,
    fileMime: row.fileMimeName || '',
    fileMimeType: getFileMimeType(row.fileMimeName),
    fileThumbnailPath: row.thumbnailPath || ''
  });
  */
  /*
  Relational API
  */
  const record = await db.query.fileManager.findFirst({
    where: eq(schema.fileManager.id, BigInt(id)),
    with: {
      fileMime: {
        columns: { name: true },
      },
      thumbnail: {
        columns: { filePath: true },
      },
    },
  });

  if (!record) {
    return null;
  }

  const result: FileManager = mapToFileManager(record, {
    cdnBase: config.public.cdnBase,
    fileMime: record.fileMime?.name ?? undefined,
    fileMimeType: getFileMimeType(record.fileMime?.name),
    fileThumbnailPath: record.thumbnail?.filePath ?? undefined
  });

  return result;
}
