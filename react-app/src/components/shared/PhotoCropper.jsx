import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import Modal from '../Modals/Modal';
import { spring } from '../../styles/motion';
import { cropSquareToDataUrl } from '../../lib/photo';
import './PhotoCropper.css';

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const WHEEL_SENSITIVITY = 0.0018;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getBaseScale(natural, stage) {
  if (!natural || !stage) {
    return 1;
  }
  return Math.max(stage / natural.width, stage / natural.height);
}

function getMaxOffset(natural, stage, zoom) {
  const eff = getBaseScale(natural, stage) * zoom;
  return {
    x: Math.max(0, (natural.width * eff - stage) / 2),
    y: Math.max(0, (natural.height * eff - stage) / 2),
  };
}

function clampOffset(offset, natural, stage, zoom) {
  const bounds = getMaxOffset(natural, stage, zoom);
  return {
    x: clamp(offset.x, -bounds.x, bounds.x),
    y: clamp(offset.y, -bounds.y, bounds.y),
  };
}

function distanceBetween(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function midpointOf(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/*
  Pan (mouse drag or one-finger touch) and pinch-zoom (two-finger touch)
  both ride the same Pointer Events stream -- pointersRef tracks every
  active pointer by id, dragRef snapshots whatever was true when the
  gesture started (so pinch-zoom math stays anchored even as fingers move),
  and only zoom/offset are React state since they're the only things that
  need to trigger a re-render.
*/
function PhotoCropper({ imageSrc, onConfirm, onCancel }) {
  const stageRef = useRef(null);
  const imgRef = useRef(null);
  const pointersRef = useRef(new Map());
  const dragRef = useRef(null);

  const [naturalSize, setNaturalSize] = useState(null);
  const [stageSize, setStageSize] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = stageRef.current;
    if (!el || typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect?.width;
      if (width) {
        setStageSize(width);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!naturalSize || !stageSize) {
      return;
    }
    setOffset((prev) => clampOffset(prev, naturalSize, stageSize, zoom));
    // Only the container/image dimensions changing should re-clamp here --
    // zoom changes already clamp themselves at the point they're applied.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [naturalSize, stageSize]);

  function handleImageLoad(event) {
    const img = event.currentTarget;
    setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }

  function applyZoom(nextZoom) {
    const bounded = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);
    setZoom(bounded);
    setOffset((prev) => clampOffset(prev, naturalSize, stageSize, bounded));
  }

  function handlePointerDown(event) {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const points = Array.from(pointersRef.current.values());

    if (points.length === 1) {
      dragRef.current = { mode: 'pan', startOffset: offset, startPoint: points[0] };
    } else if (points.length === 2) {
      dragRef.current = {
        mode: 'pinch',
        startDist: distanceBetween(points[0], points[1]),
        startZoom: zoom,
        startMid: midpointOf(points[0], points[1]),
        startOffset: offset,
      };
    }
  }

  function handlePointerMove(event) {
    if (!pointersRef.current.has(event.pointerId)) {
      return;
    }
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const points = Array.from(pointersRef.current.values());
    const drag = dragRef.current;
    if (!drag || !naturalSize || !stageSize) {
      return;
    }

    if (drag.mode === 'pan' && points.length === 1) {
      const dx = points[0].x - drag.startPoint.x;
      const dy = points[0].y - drag.startPoint.y;
      setOffset(
        clampOffset({ x: drag.startOffset.x + dx, y: drag.startOffset.y + dy }, naturalSize, stageSize, zoom),
      );
    } else if (drag.mode === 'pinch' && points.length === 2) {
      const dist = distanceBetween(points[0], points[1]);
      const mid = midpointOf(points[0], points[1]);
      const nextZoom = clamp((drag.startDist > 0 ? dist / drag.startDist : 1) * drag.startZoom, MIN_ZOOM, MAX_ZOOM);
      const dx = mid.x - drag.startMid.x;
      const dy = mid.y - drag.startMid.y;
      setZoom(nextZoom);
      setOffset(
        clampOffset(
          { x: drag.startOffset.x + dx, y: drag.startOffset.y + dy },
          naturalSize,
          stageSize,
          nextZoom,
        ),
      );
    }
  }

  function handlePointerUp(event) {
    pointersRef.current.delete(event.pointerId);
    const points = Array.from(pointersRef.current.values());
    if (points.length === 1) {
      dragRef.current = { mode: 'pan', startOffset: offset, startPoint: points[0] };
    } else if (points.length === 0) {
      dragRef.current = null;
    }
  }

  function handleWheel(event) {
    event.preventDefault();
    applyZoom(zoom - event.deltaY * WHEEL_SENSITIVITY);
  }

  function handleConfirm() {
    if (!naturalSize || !stageSize || !imgRef.current) {
      return;
    }
    const eff = getBaseScale(naturalSize, stageSize) * zoom;
    const sourceSize = stageSize / eff;
    const centerX = naturalSize.width / 2 - offset.x / eff;
    const centerY = naturalSize.height / 2 - offset.y / eff;
    const dataUrl = cropSquareToDataUrl(imgRef.current, centerX - sourceSize / 2, centerY - sourceSize / 2, sourceSize);
    onConfirm(dataUrl);
  }

  const eff = getBaseScale(naturalSize, stageSize) * zoom;
  const imageStyle = naturalSize
    ? {
        width: naturalSize.width * eff,
        height: naturalSize.height * eff,
        transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px)`,
      }
    : { opacity: 0 };

  return (
    <Modal onClose={onCancel} className="photo-cropper-modal">
      <div className="modal-header">
        <h3>Adjust photo</h3>
      </div>

      <div
        ref={stageRef}
        className="photo-cropper-stage"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
      >
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <img ref={imgRef} src={imageSrc} onLoad={handleImageLoad} draggable={false} style={imageStyle} />
      </div>

      <p className="photo-cropper-hint">Drag to reposition &middot; pinch or scroll to zoom</p>

      <input
        type="range"
        className="photo-cropper-zoom-slider"
        min={MIN_ZOOM}
        max={MAX_ZOOM}
        step={0.01}
        value={zoom}
        onChange={(event) => applyZoom(Number(event.target.value))}
        aria-label="Zoom"
      />

      <div className="modal-actions">
        <motion.button
          type="button"
          className="secondary-button"
          onClick={onCancel}
          whileHover={{ y: -1, transition: spring.hover }}
          whileTap={{ y: 1, scale: 0.96, transition: spring.press }}
        >
          Cancel
        </motion.button>
        <motion.button
          type="button"
          className="primary-button"
          onClick={handleConfirm}
          disabled={!naturalSize}
          whileHover={{ y: -2, transition: spring.hover }}
          whileTap={{ y: 1, scale: 0.95, transition: spring.commit }}
        >
          Use photo
        </motion.button>
      </div>
    </Modal>
  );
}

export default PhotoCropper;
