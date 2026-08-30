import { useState } from 'react';
import CameraCapture from './CameraCapture';
import { supportsCamera } from '../../lib/photo';

// Thin-stroke camera glyph, same line-icon language as BottomNav's own
// icons (viewBox 24, ~1.6 stroke, round joins) -- a body outline with a
// small top bump for the viewfinder and a lens circle, nothing fancier.
function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        d="M4 8.5a1.5 1.5 0 0 1 1.5-1.5H8l1-2h6l1 2h2.5A1.5 1.5 0 0 1 20 8.5V17a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12.5" r="3.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

/*
  One camera-icon button standing in for the old side-by-side "Take
  Photo" / "Choose from Library" text buttons (still both present --
  tapping the icon reveals them as a small menu, same interaction
  ProfilePage's own share button uses). Owns the whole trigger side of
  the photo pipeline (menu, the two file inputs, CameraCapture); the
  caller still owns validating/resizing whatever comes back, since that
  differs slightly by call site (see each `processPhotoFile`).
*/
function PhotoPickerButton({ onPhotoFile, disabled, className }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    setIsMenuOpen(false);
    if (file) {
      onPhotoFile(file);
    }
  }

  function handleCameraCapture(blob) {
    setIsCameraOpen(false);
    onPhotoFile(blob);
  }

  return (
    <div className={`photo-picker${className ? ` ${className}` : ''}`}>
      <button
        type="button"
        className="photo-picker-button"
        aria-label="Add a photo"
        disabled={disabled}
        onClick={() => setIsMenuOpen((prev) => !prev)}
      >
        <CameraIcon />
      </button>

      {isMenuOpen && (
        <div className="photo-picker-menu">
          {supportsCamera ? (
            <button
              type="button"
              className="photo-picker-menu-item"
              disabled={disabled}
              onClick={() => {
                setIsMenuOpen(false);
                setIsCameraOpen(true);
              }}
            >
              Take Photo
            </button>
          ) : (
            <label className="photo-picker-menu-item">
              Take Photo
              <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} disabled={disabled} />
            </label>
          )}
          <label className="photo-picker-menu-item">
            Choose from Library
            <input type="file" accept="image/*" onChange={handleFileChange} disabled={disabled} />
          </label>
        </div>
      )}

      {isCameraOpen && <CameraCapture onCapture={handleCameraCapture} onClose={() => setIsCameraOpen(false)} />}
    </div>
  );
}

export default PhotoPickerButton;
