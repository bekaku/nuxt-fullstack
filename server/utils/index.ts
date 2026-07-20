export type FileMimeType = 'IMAGE' | 'VIDEO' | 'FILE' | 'DIRECTORY';

/**
* Converts common MIME type strings to FileMimeType groups.
* @param mime, e.g., 'image/jpeg', 'video/mp4', 'application/pdf'
*/
export const getFileMimeType = (mime?: string | null): FileMimeType => {
  if (!mime) {
    return 'FILE';
  }

  const lowerMime = mime.toLowerCase();

  if (lowerMime.startsWith('image/')) {
    return 'IMAGE';
  }

  if (lowerMime.startsWith('video/')) {
    return 'VIDEO';
  }

  //This is in case a dummy folder is created and the MIME address is set to a directory.
  if (lowerMime === 'inode/directory' || lowerMime === 'directory') {
    return 'DIRECTORY';
  }

  return 'FILE';
};
