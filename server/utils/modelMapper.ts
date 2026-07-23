import type { InferSelectModel } from 'drizzle-orm';
import { FileMimeType } from '~/types/common';
import { FileManager } from '~/types/models';
import { fileManager } from '~~/server/database/schema';

type DbFileManager = InferSelectModel<typeof fileManager>;

/**
 * @param record
 * @param optional
 */
export const mapToFileManager = (
  record: DbFileManager,
  optional?: {
    cdnBase?: string;
    fileMime?: string;
    fileThumbnailPath?: string;
    fileMimeType?: FileMimeType;
  }
): FileManager => {
  return {
    fileName: record.originalFileName || record.fileName || '',
    filePath: optional?.cdnBase ? `${optional.cdnBase}/${record.filePath}` : record.filePath,
    fileSize: record.fileSize ? Number(record.fileSize) : 0,
    createdDate: record.createdDate ? record.createdDate.toISOString() : undefined,
    updatedDate: record.updatedDate ? record.updatedDate.toISOString() : undefined,
    deleteFlag: record.deleted !== null ? record.deleted : undefined,
    fileMime: optional?.fileMime || '',
    fileThumbnailPath: optional?.fileThumbnailPath || undefined,
    fileMimeType: optional?.fileMimeType,
    id: record.id ? record.id.toString() : undefined,
    duration: record.duration || 0,
    title: record.title || undefined,
    description: record.description || undefined,
  } as FileManager;
};
