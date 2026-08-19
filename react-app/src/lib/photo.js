export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

// Photos are persisted as base64 in localStorage, which caps out around
// 5-10MB per origin -- a couple of uncompressed camera photos blow that
// budget on their own. Downscaling to a reasonable display size before
// encoding keeps each stored photo in the tens-to-low-hundreds of KB, so
// completing many Buckets with photos doesn't run the storage out.
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

export const supportsCamera =
  typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia);

function readImageAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not decode image'));
    img.src = src;
  });
}

export async function resizeImageToDataUrl(file) {
  const original = await readImageAsDataUrl(file);
  const img = await loadImage(original);

  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
  const width = Math.round(img.width * scale);
  const height = Math.round(img.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(img, 0, 0, width, height);

  return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
}
