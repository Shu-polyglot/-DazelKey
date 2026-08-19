import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import Modal from '../Modals/Modal';
import { spring } from '../../styles/motion';

const commitTapProps = {
  whileHover: { y: -2, transition: spring.hover },
  whileTap: { y: 1, scale: 0.95, transition: spring.commit },
};

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

// Photos are persisted as base64 in localStorage, which caps out around
// 5-10MB per origin -- a couple of uncompressed camera photos blow that
// budget on their own. Downscaling to a reasonable display size before
// encoding keeps each stored photo in the tens-to-low-hundreds of KB, so
// completing many Buckets with photos doesn't run the storage out.
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

const supportsCamera =
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

async function resizeImageToDataUrl(file) {
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

/*
  Live in-page camera preview for the "Take Photo" option. Uses
  getUserMedia rather than relying on <input capture> to launch a
  picker, since which OS picker (if any) that attribute opens varies
  by browser/OS and isn't dependable. Captured frame is handed back as
  a Blob, which feeds the exact same resizeImageToDataUrl pipeline as
  a file selected from the library.
*/
function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraError, setCameraError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCameraError(true);
        }
      });

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  function handleShutter() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) {
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          onCapture(blob);
        }
      },
      'image/jpeg',
      0.92,
    );
  }

  return (
    <Modal onClose={onClose} className="camera-capture-modal">
      <div className="modal-header">
        <h3>Take a photo</h3>
        <motion.button
          type="button"
          className="icon-button"
          aria-label="Close camera"
          onClick={onClose}
          whileHover={{ rotate: 90, transition: spring.hover }}
          whileTap={{ scale: 0.88, transition: spring.press }}
        >
          ×
        </motion.button>
      </div>

      {cameraError ? (
        <p className="camera-capture-error">
          Couldn’t access the camera. Check your browser’s camera permission, or choose a photo instead.
        </p>
      ) : (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video ref={videoRef} autoPlay playsInline muted className="camera-capture-video" />
      )}

      <div className="detail-actions">
        <motion.button type="button" className="secondary-button" onClick={onClose} {...commitTapProps}>
          Cancel
        </motion.button>
        {!cameraError && (
          <motion.button type="button" className="achieve-button" onClick={handleShutter} {...commitTapProps}>
            Capture
          </motion.button>
        )}
      </div>
    </Modal>
  );
}

/*
  Shared by ExpandedBucketCard and BucketDetailsModal -- the two places a
  Bucket can be completed. Photo is optional: completing never blocks on it.
*/
function CompletePrompt({ bucketId, onComplete }) {
  const [completeDate, setCompleteDate] = useState('');
  const [photo, setPhoto] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  async function processPhotoFile(file) {
    if (file.size > MAX_PHOTO_BYTES) {
      alert('That photo is too large. Choose one under 5MB.');
      return;
    }
    try {
      setPhoto(await resizeImageToDataUrl(file));
    } catch (error) {
      console.warn('Unable to process photo.', error);
      alert('Could not read that photo. Try a different file.');
    }
  }

  async function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }
    await processPhotoFile(file);
  }

  function handleCameraCapture(blob) {
    setIsCameraOpen(false);
    processPhotoFile(blob);
  }

  function handleComplete() {
    if (!completeDate) {
      alert('Choose the date this experience happened.');
      return;
    }

    onComplete(bucketId, completeDate, photo);
  }

  return (
    <div className="achieve-prompt">
      <p className="achieve-prompt-label">Did you do it?</p>
      <label className="achieve-date-field">
        <span>When</span>
        <input type="date" value={completeDate} onChange={(event) => setCompleteDate(event.target.value)} />
      </label>

      <div className="achieve-photo-field">
        <span>Photo (optional)</span>
        {photo ? (
          <div className="achieve-photo-preview">
            <img src={photo} alt="" />
            <button
              type="button"
              className="achieve-photo-remove"
              onClick={() => setPhoto(null)}
              aria-label="Remove photo"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="achieve-photo-actions">
            {supportsCamera ? (
              <button type="button" className="achieve-photo-upload" onClick={() => setIsCameraOpen(true)}>
                Take Photo
              </button>
            ) : (
              <span className="achieve-photo-upload">
                Take Photo
                <input type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} />
              </span>
            )}
            <span className="achieve-photo-upload">
              Choose from Library
              <input type="file" accept="image/*" onChange={handlePhotoChange} />
            </span>
          </div>
        )}
      </div>

      <motion.button type="button" className="achieve-button" onClick={handleComplete} {...commitTapProps}>
        Complete
      </motion.button>

      {isCameraOpen && (
        <CameraCapture onCapture={handleCameraCapture} onClose={() => setIsCameraOpen(false)} />
      )}
    </div>
  );
}

export default CompletePrompt;
