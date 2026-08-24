import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { easing } from '../../styles/motion';

/**
 * Atmospheric backdrop for the opening experience -- a looping night-sea
 * video (moon, stars, water) standing in for the DazelKey world the user is
 * about to enter. One persistent instance carries across every onboarding
 * step (see OpeningExperience), so it plays continuously rather than
 * restarting per step. A thin black/navy wash + vignette, both built from
 * the app's existing void/glow tokens, keep the footage legible under text
 * without flattening it or breaking from the rest of the product's palette.
 *
 * Autoplay is more fragile in Safari than Chrome, so playback here is
 * belt-and-suspenders: `muted`/`playsInline` are set both as JSX attributes
 * (so they're present the instant the element exists) and imperatively on
 * the element (Safari's autoplay gate checks the live `muted`/`defaultMuted`
 * properties, not just the attribute), and `play()` is retried on the load
 * lifecycle events instead of fired once on mount -- a single early call can
 * lose a race with Safari's decoder/autoplay-eligibility check before the
 * video has enough data to actually start. If autoplay is still refused
 * (e.g. a user has Safari's per-site "Never Auto-Play" set -- something no
 * page can override), the `poster` frame keeps the scene intact instead of
 * showing a blank layer.
 */
function CinematicBackground() {
  const prefersReducedMotion = useReducedMotion();
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    video.defaultMuted = true;
    video.muted = true;

    if (prefersReducedMotion) {
      video.pause();
      return undefined;
    }

    let cancelled = false;

    function attemptPlay() {
      if (cancelled || !video.paused) return;
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        // Safari rejects this promise when autoplay is blocked by a site
        // setting rather than a timing issue -- nothing to recover from
        // without a user gesture, so the poster frame carries the scene.
        playPromise.catch(() => {});
      }
    }

    attemptPlay();
    video.addEventListener('loadedmetadata', attemptPlay);
    video.addEventListener('loadeddata', attemptPlay);
    video.addEventListener('canplay', attemptPlay);
    document.addEventListener('visibilitychange', attemptPlay);

    return () => {
      cancelled = true;
      video.removeEventListener('loadedmetadata', attemptPlay);
      video.removeEventListener('loadeddata', attemptPlay);
      video.removeEventListener('canplay', attemptPlay);
      document.removeEventListener('visibilitychange', attemptPlay);
    };
  }, [prefersReducedMotion]);

  return (
    <div className="cinematic-background" aria-hidden="true">
      <motion.video
        ref={videoRef}
        className="cinematic-video"
        src="/videos/sea-night.mp4"
        poster="/videos/sea-night-poster.jpg"
        autoPlay
        muted
        loop
        playsInline
        webkit-playsinline="true"
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.2, ease: easing.emphasized }}
      />
      <div className="cinematic-overlay" />
      <div className="cinematic-vignette" />
    </div>
  );
}

export default CinematicBackground;
