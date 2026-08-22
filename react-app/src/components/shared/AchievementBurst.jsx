import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { easing } from '../../styles/motion';
import './AchievementBurst.css';

// Mobile-perf cap from spec: 60-90 particles.
const PARTICLE_COUNT = 72;
const SPREAD_MS = 380; // phase 1: burst outward from origin
const CONVERGE_MS = 380; // phase 2: decelerate, U-turn, land on the card
const CARD_HOLD_MS = 1500; // how long the landed card stays before fading
const CARD_EXIT_MS = 300;

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

// Reads the app's own accent tokens rather than hardcoding a color --
// --color-glow-rgb / --color-glow-bright-rgb are the same hues as
// --color-accent / --color-accent-strong, just as bare R,G,B triples so
// they can be composed into rgba() at whatever alpha a given particle
// needs.
function readAccentColors() {
  const style = getComputedStyle(document.documentElement);
  const glow = style.getPropertyValue('--color-glow-rgb').trim() || '111, 155, 199';
  const glowBright = style.getPropertyValue('--color-glow-bright-rgb').trim() || '157, 199, 236';
  return [glow, glowBright];
}

function buildParticles() {
  const colors = readAccentColors();
  const particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i += 1) {
    particles.push({
      angle: Math.random() * Math.PI * 2,
      spreadDistance: 70 + Math.random() * 190,
      size: 1.5 + Math.random() * 2.5,
      color: colors[i % colors.length],
      alpha: 0.55 + Math.random() * 0.35,
      // A small stagger so the burst reads as organic particles rather
      // than one perfectly synchronized ring.
      delay: Math.random() * 90,
    });
  }
  return particles;
}

/*
  A lightweight, same-screen celebration for the moment an Achievement
  card is generated -- Bucket List completion (App.jsx's
  handleCompleteBucket) or a Realize/Doing goal reaching 100%
  (handleAchievementPhotoDone). Deliberately NOT the full-screen
  MilestoneRitual takeover it sits alongside: no dim, no navigation, the
  underlying screen stays fully interactive the entire time (this whole
  layer is pointer-events: none).

  `origin` is the completion tap's viewport coordinates ({x, y}); pass
  null when the triggering action happened inside a full-screen prompt
  with no meaningful "where on the page" to point back to (e.g. the
  Doing-goal photo prompt) -- this then defaults to screen center.
  `target` (the card's landing spot, {x, y}) is optional too, defaulting
  to an upper-center resting position clear of the bottom nav.
*/
function AchievementBurst({ origin, target, achievement, onDone }) {
  const canvasRef = useRef(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const originX = origin?.x ?? width / 2;
    const originY = origin?.y ?? height / 2;
    const targetX = target?.x ?? width / 2;
    const targetY = target?.y ?? height * 0.38;
    targetRef.current = { x: targetX, y: targetY };

    const particles = buildParticles();
    let rafId;
    const start = performance.now();

    function frame(now) {
      const elapsed = now - start;
      ctx.clearRect(0, 0, width, height);

      let allLanded = true;
      particles.forEach((p) => {
        const t = elapsed - p.delay;
        let x = originX;
        let y = originY;
        let alpha = p.alpha;

        if (t <= 0) {
          allLanded = false;
        } else if (t < SPREAD_MS) {
          // Phase 1: ease-out spread away from the origin.
          const progress = easeOutCubic(t / SPREAD_MS);
          x = originX + Math.cos(p.angle) * p.spreadDistance * progress;
          y = originY + Math.sin(p.angle) * p.spreadDistance * progress;
          allLanded = false;
        } else if (t < SPREAD_MS + CONVERGE_MS) {
          // Phase 2: U-turn and decelerate into the card's landing spot.
          const spreadX = originX + Math.cos(p.angle) * p.spreadDistance;
          const spreadY = originY + Math.sin(p.angle) * p.spreadDistance;
          const progress = easeOutCubic((t - SPREAD_MS) / CONVERGE_MS);
          x = spreadX + (targetX - spreadX) * progress;
          y = spreadY + (targetY - spreadY) * progress;
          alpha = p.alpha * (1 - progress * 0.7);
          allLanded = false;
        } else {
          alpha = 0;
        }

        if (alpha > 0.01) {
          ctx.beginPath();
          ctx.fillStyle = `rgba(${p.color}, ${alpha})`;
          ctx.arc(x, y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      if (!allLanded) {
        rafId = requestAnimationFrame(frame);
      } else {
        setShowCard(true);
      }
    }

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!showCard) {
      return undefined;
    }
    const timer = setTimeout(onDone, CARD_HOLD_MS + CARD_EXIT_MS);
    return () => clearTimeout(timer);
  }, [showCard, onDone]);

  const cardTarget = targetRef.current;

  return (
    <div className="achievement-burst" aria-hidden="true">
      <canvas ref={canvasRef} className="achievement-burst-canvas" />
      <AnimatePresence>
        {showCard && (
          <motion.div
            className="achievement-burst-card"
            style={{ left: cardTarget.x, top: cardTarget.y }}
            initial={{ opacity: 0, scale: 0.8, x: '-50%', y: '-50%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%', transition: { duration: 0.35, ease: easing.emphasized } }}
            exit={{ opacity: 0, scale: 0.92, transition: { duration: CARD_EXIT_MS / 1000, ease: easing.exit } }}
          >
            <div className="achievement-burst-card-frame">
              {achievement?.image ? (
                <div className="achievement-burst-card-photo" style={{ backgroundImage: `url(${achievement.image})` }} />
              ) : (
                <div className="achievement-burst-card-glow" />
              )}
              <div className="achievement-burst-card-scrim" />
              <span className="achievement-burst-card-eyebrow">Achievement unlocked</span>
              <p className="achievement-burst-card-title">{achievement?.title}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AchievementBurst;
