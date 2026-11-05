const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const UPLOAD_URL = CLOUD_NAME ? `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload` : null;

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  bytes: number;
  width: number;
  height: number;
}

export class CloudinaryUploadError extends Error {
  readonly code: 'MISSING_CONFIG' | 'UPLOAD_FAILED';

  constructor(message: string, code: 'MISSING_CONFIG' | 'UPLOAD_FAILED') {
    super(message);
    this.name = 'CloudinaryUploadError';
    this.code = code;
  }
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(CLOUD_NAME && UPLOAD_PRESET);
}

export async function uploadImageToCloudinary(
  file: File,
  onProgress?: (percent: number) => void,
  signal?: AbortSignal,
): Promise<CloudinaryUploadResult> {
  if (!CLOUD_NAME || !UPLOAD_PRESET || !UPLOAD_URL) {
    throw new CloudinaryUploadError(
      'Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in frontend/.env.local.',
      'MISSING_CONFIG',
    );
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const handleAbort = () => xhr.abort();
    const cleanup = () => signal?.removeEventListener('abort', handleAbort);

    xhr.open('POST', UPLOAD_URL);
    xhr.responseType = 'json';

    if (signal?.aborted) {
      reject(new CloudinaryUploadError('Upload cancelled.', 'UPLOAD_FAILED'));
      return;
    }

    signal?.addEventListener('abort', handleAbort, { once: true });

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || !onProgress) return;
      const percent = Math.round((event.loaded / event.total) * 100);
      onProgress(percent);
    };

    xhr.onload = () => {
      cleanup();
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response as CloudinaryUploadResult);
      } else {
        const message =
          xhr.response?.error?.message ||
          `Cloudinary upload failed with status ${xhr.status}. Check your upload preset and allowed file types.`;
        reject(new CloudinaryUploadError(message, 'UPLOAD_FAILED'));
      }
    };

    xhr.onerror = () => {
      cleanup();
      reject(new CloudinaryUploadError('Network error while uploading to Cloudinary.', 'UPLOAD_FAILED'));
    };

    xhr.onabort = () => {
      cleanup();
      reject(new CloudinaryUploadError('Upload cancelled.', 'UPLOAD_FAILED'));
    };

    xhr.send(formData);
  });
}
