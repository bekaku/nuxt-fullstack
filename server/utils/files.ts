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

export const deleteFileManager = async (id: bigint): Promise<{
  id: string,
  filePath: string,
  fileName: string,
} | null> => {
  const db = useDb()
  try {
    const record = await db.query.fileManager.findFirst({
      where: eq(schema.fileManager.id, id),
      columns: {
        id: true,
        filePath: true,
        fileName: true,
      },
      with: {
        thumbnail: {
          columns: { filePath: true, id: true }
        }
      }
    });

    if (!record || !record.filePath) {
      throw createError({
        statusCode: 404,
        statusMessage: 'File not found'
      })
    }
    //delete thumbnail if exists
    if (record.thumbnail && record.thumbnail.filePath) {
      await deleteFileFromStorage(record.thumbnail.filePath)
      await db
        .delete(schema.fileManager)
        .where(eq(schema.fileManager.id, BigInt(record.thumbnail.id)))
    }

    //delete file from storage
    await deleteFileFromStorage(record.filePath)

    //delete from db
    await db
      .delete(schema.fileManager)
      .where(eq(schema.fileManager.id, BigInt(id)))


    return {
      id: record.id.toString(),
      filePath: record.filePath,
      fileName: record.fileName || ''
    };

  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete file'
    })
  }
}
