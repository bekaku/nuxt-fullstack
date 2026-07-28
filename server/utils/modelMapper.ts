import type { InferSelectModel } from 'drizzle-orm';
import { FileMimeType } from '~/types/common';
import { AppUser, FileManager } from '~/types/models';
import { fileManager, appUser } from '~~/server/database/schema';


/**
 * @param record
 * @param optional
 */
export const mapToFileManager = (
  record: InferSelectModel<typeof fileManager>,
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
export const mapToAppUser = (
  record: InferSelectModel<typeof appUser>,
  optional?: {
    cdnBase?: string;
    avatarPath?: string;
    coverPath?: string;
  }
): AppUser => {
  return {
    id: record.id,
    email: record.email,
    username: record.username,
    active: record.active,
    createdDate: record.createdDate ? record.createdDate.toISOString() : undefined,
    avatar: optional?.avatarPath ? {
      image: optional?.cdnBase ? `${optional.cdnBase}/${optional.avatarPath}` : optional.avatarPath
    } : null,
    cover: optional?.coverPath ? {
      image: optional?.coverPath ? `${optional.coverPath}/${optional.coverPath}` : optional.coverPath
    } : null
  };
};
