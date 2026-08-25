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

export async function resizeImageToDataUrl(file, { maxDimension = MAX_DIMENSION, quality = JPEG_QUALITY } = {}) {
  const original = await readImageAsDataUrl(file);
  const img = await loadImage(original);

  const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
  const width = Math.round(img.width * scale);
  const height = Math.round(img.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(img, 0, 0, width, height);

  return canvas.toDataURL('image/jpeg', quality);
}

// Avatars are always cropped to a square, then displayed as either a square
// or a circle (border-radius) depending on where they're used -- so the
// stored source only ever needs to be one fixed square size.
export const AVATAR_OUTPUT_SIZE = 512;
const AVATAR_JPEG_QUALITY = 0.9;

// sourceX/sourceY/sourceSize describe the square region to lift out of the
// source image, in that image's own natural pixel coordinates.
export function cropSquareToDataUrl(image, sourceX, sourceY, sourceSize, outputSize = AVATAR_OUTPUT_SIZE) {
  const canvas = document.createElement('canvas');
  canvas.width = outputSize;
  canvas.height = outputSize;
  canvas.getContext('2d').drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, outputSize, outputSize);
  return canvas.toDataURL('image/jpeg', AVATAR_JPEG_QUALITY);
}
