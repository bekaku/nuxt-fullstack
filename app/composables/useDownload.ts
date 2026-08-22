import type { DownloadConfig, DownloadHistoryItem, DownloadProgress } from "~/types/common";

export const useDownload = (options?: {
  chunkSize?: number;
  maxRetries?: number;
}) => {

  const api = useApi(); // สมมติว่าคืนค่าเป็น $fetch instance หรือ ofetch
  const { cdnBase } = useConfiguration();
  const { t } = useLang();
  const chunkSize = options?.chunkSize || 8192; // 8192 KB
  const isDownloading = ref(false);
  const error: Ref<string | null> = ref(null);
  const cancelTokenSource: Ref<AbortController | null> = ref(null);
  const downloadHistory: Ref<DownloadHistoryItem[]> = ref([]);
  const downloadProgress = reactive<DownloadProgress>({
    visible: false,
    loaded: 0,
    total: 0,
    percentage: 0,
    speed: '0 B/s',
    startTime: null,
    filename: null
  });

  const formatSpeed = (bytesPerSecond: number): string => {
    return formatBytes(bytesPerSecond) + '/s';
  };

  const startDownload = (config: DownloadConfig): void => {
    isDownloading.value = true;
    downloadProgress.visible = true;
    downloadProgress.loaded = 0;
    downloadProgress.total = 0;
    downloadProgress.percentage = 0;
    downloadProgress.speed = '0 B/s';
    downloadProgress.startTime = Date.now();
    downloadProgress.filename = config.filename || config.url || `File id #${config.fileId}`;
    error.value = null;
  };

  // เปลี่ยนจากการรับ AxiosProgressEvent เป็น loaded และ total โดยตรง
  const updateProgress = (loaded: number, total: number): void => {
    downloadProgress.loaded = loaded;
    downloadProgress.total = total;

    if (total > 0) {
      downloadProgress.percentage = (loaded / total) * 100;
    }

    // Calculate speed
    if (downloadProgress.startTime) {
      const elapsed = (Date.now() - downloadProgress.startTime) / 1000;
      if (elapsed > 0) {
        const speed = loaded / elapsed;
        downloadProgress.speed = formatSpeed(speed);
      }
    }
  };

  const endDownload = (): void => {
    isDownloading.value = false;
    downloadProgress.visible = false;
    cancelTokenSource.value = null;
  };

  const saveBlob = (blob: Blob, filename: string, config: DownloadConfig): Promise<DownloadHistoryItem> => {
    const fileType = blob.type;
    const url = window.URL.createObjectURL(blob);

    if (config.downloadable !== false) {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }

    // Add to history
    const useDuration = downloadProgress.startTime
      ? Date.now() - downloadProgress.startTime
      : 0;

    const historyItem: DownloadHistoryItem = {
      id: Date.now(),
      type: fileType,
      src: url,
      filename,
      size: blob.size,
      status: 'completed',
      duration: useDuration,
      timestamp: new Date().toISOString()
    };

    if (config.historyable !== false) {
      downloadHistory.value.unshift(historyItem);
      // Keep only last 10 downloads
      if (downloadHistory.value.length > 10) {
        downloadHistory.value = downloadHistory.value.slice(0, 10);
      }
    }
    return Promise.resolve(historyItem);
  };

  const addFailedDownload = (filename: string, errorMessage: string): void => {
    const useDuration = downloadProgress.startTime
      ? Date.now() - downloadProgress.startTime
      : 0;

    const historyItem: DownloadHistoryItem = {
      id: Date.now(),
      filename,
      size: 0,
      status: 'failed',
      duration: useDuration,
      timestamp: new Date().toISOString(),
      error: errorMessage
    };

    downloadHistory.value.unshift(historyItem);
  };

  const downloadFile = async (config: DownloadConfig): Promise<DownloadHistoryItem | null> => {
    console.log('downloadFile', config);
    if (!config.filename) {
      throw new Error('Please enter a filename');
    }

    const downloadUrl = config.url ? config.url : config.fileId ? `/api/fileManager/files-stream?id=${config.fileId}` : '';
    const cdnBaseURL = config?.baseUrl || cdnBase;

    console.log('downloadUrl', { cdnBaseURL, downloadUrl });
    startDownload(config);
    cancelTokenSource.value = new AbortController();

    try {
     // Call api.raw() or $fetch.raw() to access Response Headers (Content-Length) and Stream.
      const response = await api.raw(downloadUrl, {
        method: "GET",
        query: {
          chunkSize: config.chunkSize || chunkSize,
        },
        // baseURL: cdnBaseURL || '',
        responseType: "stream",
        signal: cancelTokenSource.value.signal,
        timeout: 0,
      });

    // Extract the total file size from the header.
      const totalLength = Number(response.headers.get('content-length')) || 0;

      // Handle reading the stream chunk by chunk for progress.
      const reader = (response._data as ReadableStream<Uint8Array>).getReader();
      const chunks: Uint8Array[] = [];
      let loadedLength = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        if (value) {
          chunks.push(value);
          loadedLength += value.length;
          updateProgress(loadedLength, totalLength);
        }
      }

      // Combine all chunks to form a new blob.
      const contentType = response.headers.get('content-type') || 'application/octet-stream';
      const blob = new Blob(chunks as BlobPart[], { type: contentType });

      console.log('response stream completely read', blob);
      const downloadedItem = await saveBlob(blob, config.filename, config);
      return downloadedItem;

    } catch (err: any) {
      const cancelErrorText = t('drive.downloadCancelled');

     // Native Fetch API will throw an error named 'AbortError' when canceled.
      if (err.name === 'AbortError' || err.name === 'CanceledError') {
        error.value = cancelErrorText;
        if (config.historyable !== false) {
          addFailedDownload(config.filename, cancelErrorText);
        }
      } else {
        // Most error responses from ofetch are found in err.data.
        const errorMsg = err.data?.message || err.message || 'Download failed';
        error.value = `Download failed: ${errorMsg}`;
        if (config.historyable !== false) {
          addFailedDownload(config.filename, errorMsg);
        }
      }
      return null;
    } finally {
      endDownload();
    }
  };

  const cancleDownload = (): void => {
    if (cancelTokenSource.value) {
      cancelTokenSource.value.abort();
    }
  };

  return {
    isDownloading,
    downloadProgress,
    downloadHistory,
    error,
    downloadFile,
    cancleDownload,
    formatBytes
  };
};
