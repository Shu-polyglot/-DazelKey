import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import Modal from '../Modals/Modal';
import { spring } from '../../styles/motion';

const commitTapProps = {
  whileHover: { y: -2, transition: spring.hover },
  whileTap: { y: 1, scale: 0.95, transition: spring.commit },
};

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

export default CameraCapture;
