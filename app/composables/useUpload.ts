import type { ResponseEntity, UploadStatus } from "~/types/common";
import type { FileManager, FileManagerMetaData } from "~/types/models";

export const useUpload = () => {

  const api = useApi();
  const files = ref<FileManager[]>([])
  const uploading = ref(false)
  const progress = ref(0)
  const status = ref<UploadStatus>();
  const CHUNK_SIZE = 1024 * 1024;
  const MAX_RETRIES = 3;

  // Track uploaded chunks for resume support
  const uploadedChunks = new Set<number>()
  const chunkFileName = ref<string>('');
  const currentFileIndex = ref(0)

  const onChunkUploadClear = () => {
    chunkFileName.value = '';
    progress.value = 0;
    status.value = undefined;
    uploadedChunks.clear()
  }
  const setDownloadProgress = (index: number, statusParam: UploadStatus, uploading: boolean, progressParam?: number | undefined): Promise<void> => {
    const item = files.value[index]
    if (item && item.uploadProgress) {
      item.uploadProgress = {
        progress: progressParam || item.uploadProgress.progress,
        uploading: uploading,
        status: statusParam
      }
      files.value[index] = item
    }
    if (progressParam != undefined) {
      progress.value = progressParam;
    }
    status.value = statusParam
    return Promise.resolve();
  }
  const setDownloadStatus = (): Promise<void> => {
    const item = files.value[currentFileIndex.value]
    if (item) {
      item.uploadProgress = {
        progress: 0,
        uploading: true,
        status: 'UPLOADING',
        uploadData: null
      }
      files.value[currentFileIndex.value] = item
    }
    return Promise.resolve();
  }
  const checkAlreadyUpload = async (index: number): Promise<boolean> => {
    const item = files.value[index]
    if (item && item.uploadProgress) {
      return item.uploadProgress.status === 'COMPLETED'
    }
    return false
  }

  const onUploadChunk = async (file: File, options?: {
    uniqueId?: string;
    filename?: string;
    setProgress?: boolean;
    chunkSize?: number;
    maxRetries?: number;
    metaData?: FileManagerMetaData
  }): Promise<FileManager | null> => {
    if (!file) return null;
    onChunkUploadClear();

    const chunkSize = options?.chunkSize || CHUNK_SIZE;
    const maxRetries = options?.maxRetries || MAX_RETRIES;
    const totalChunks = Math.ceil(file.size / chunkSize);
    const filename = options?.filename || file.name;
    const uniqueId = options?.uniqueId || generateSnowFlakeId().toString();
    const setProgress = options?.setProgress ?? true;

    let responseFile: FileManager | null = null;

    try {
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        if (uploadedChunks.has(chunkIndex)) continue

        const start = chunkIndex * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append("chunk", chunk);
        formData.append("filename", filename);
        formData.append("uniqueId", uniqueId);
        formData.append("chunkIndex", chunkIndex.toString());
        formData.append("totalChunks", totalChunks.toString());
        if (options?.metaData) {
          if (options.metaData?.duration) {
            formData.append("duration", options.metaData.duration.toString());
          }
          if (options.metaData?.hidden) {
            formData.append("hidden", 'true');
          }
          if (options.metaData?.title) {
            formData.append("title", options.metaData.title);
          }
          if (options.metaData?.description) {
            formData.append("description", options.metaData.description);
          }
          if (options.metaData?.thumbnailFileId) {
            formData.append("thumbnailFileId", options.metaData.thumbnailFileId.toString());
          }
        }

        let chunkSuccess = false;
        for (let attempt = 0; attempt < maxRetries; attempt++) {
          try {
            console.log(`Uploading chunk ${chunkIndex + 1}/${totalChunks} (Attempt ${attempt + 1})`);
            const chunkRespone = await api<ResponseEntity<FileManager | void>>("/api/file-manager", {
              method: "POST",
              body: formData,
            });
            if (chunkRespone && chunkRespone.status === 200) {
              chunkSuccess = true;
              uploadedChunks.add(chunkIndex);
              if (chunkRespone.data && chunkRespone.data.id) {
                responseFile = chunkRespone.data;
              }
              break;
            }
          } catch (err) {
            console.warn(`Chunk ${chunkIndex} failed on attempt ${attempt + 1}`);
            if (attempt === maxRetries - 1) throw err;
          }
        }

        if (!chunkSuccess) {
          throw new Error(`Failed to upload chunk ${chunkIndex} after ${maxRetries} attempts`);
        }

        if (setProgress) {
          const progressPercent = (chunkIndex + 1) / totalChunks;
          await setDownloadProgress(currentFileIndex.value, 'UPLOADING', true, progressPercent);
        }
      }

      if (setProgress) {
        await setDownloadProgress(currentFileIndex.value, 'COMPLETED', false, 1);
      }
      console.log("Upload Complete!");
      return responseFile;

    } catch (error) {
      if (setProgress) {
        await setDownloadProgress(currentFileIndex.value, 'FAILED', false);
      }
      console.error("Upload failed:", error);
      return null;
    }
  }

  const onStartUploadChunk = async () => {
    if (files.value && files.value.length > 0) {
      uploading.value = true
      const fileItems = files.value;

      for (let index = 0; index < fileItems.length; index++) {
        const isAlreadyUpload = await checkAlreadyUpload(index);
        if (isAlreadyUpload) continue;

        const f = fileItems[index];
        if (f && f.file) {
          let metaData: FileManagerMetaData | undefined = undefined;
          currentFileIndex.value = index;
          await setDownloadStatus();

          if (f.thumbnailFile) {
            const thumbnailResponse = await onUploadChunk(f.thumbnailFile, {
              setProgress: false,
              metaData: { hidden: true }
            });

            if (thumbnailResponse && thumbnailResponse.id) {
              metaData = {
                thumbnailFileId: thumbnailResponse.id,
                duration: f.duration || 0,
                title: f.title || null,
                description: f.description || null,
                width: f.width || 0,
                height: f.height || 0,
              }
            }
          }
          const response = await onUploadChunk(f.file, {
            setProgress: true,
            metaData
          });
        }
      }
      uploading.value = false
    }
  }
  return {
    onStartUploadChunk,
    onUploadChunk,
    files,
    uploading,
    status,
    progress,
  }

}
