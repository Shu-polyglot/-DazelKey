import { useState } from 'react';
import { motion } from 'motion/react';
import { DIMENSIONS } from '../../data/traits';
import { getDimensionScores, normalizeScoreToPercent } from '../../lib/radar';
import { SCORE_MAX } from '../../lib/traitQuiz';
import { entranceTransition } from '../../styles/motion';

const SIZE = 260;
const CENTER = SIZE / 2;
const RADIUS = 84;
const LABEL_OFFSET = 20;

function angleForIndex(index) {
  return (-90 + index * (360 / DIMENSIONS.length)) * (Math.PI / 180);
}

function pointAt(radius, index) {
  const angle = angleForIndex(index);
  return { x: CENTER + radius * Math.cos(angle), y: CENTER + radius * Math.sin(angle) };
}

function labelAnchor(index) {
  const cos = Math.cos(angleForIndex(index));
  if (cos > 0.3) return 'start';
  if (cos < -0.3) return 'end';
  return 'middle';
}

/*
  All 6 dimensions always draw as an axis, even at 0 -- an empty axis is
  still meant to be read ("no score here yet"), not hidden. The filled
  shape is the only thing that reacts to the Trait Quiz's scores (see
  lib/radar.js); the grid/spokes are a fixed, quiet reference underneath
  it. Raw scores only show up on hover/tap of that axis, never at rest.
  Deliberately decoupled from Become votes -- this is a periodic
  self-check-in, not a live reflection of daily progress.
*/
function RadarChart({ scores }) {
  const [hovered, setHovered] = useState(null);
  const totals = getDimensionScores(scores);

  const polygonPoints = DIMENSIONS.map((dimension, index) => {
    const percent = normalizeScoreToPercent(totals[dimension]);
    const { x, y } = pointAt((percent / 100) * RADIUS, index);
    return `${x},${y}`;
  }).join(' ');

  const gridPoints = DIMENSIONS.map((_, index) => {
    const { x, y } = pointAt(RADIUS, index);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="radar-chart-wrap">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="radar-chart" role="img" aria-label="Dimensions radar chart">
        <polygon points={gridPoints} className="radar-chart-grid" />
        {DIMENSIONS.map((dimension, index) => {
          const spoke = pointAt(RADIUS, index);
          return <line key={dimension} x1={CENTER} y1={CENTER} x2={spoke.x} y2={spoke.y} className="radar-chart-spoke" />;
        })}

        <motion.polygon
          points={polygonPoints}
          className="radar-chart-value"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={entranceTransition(0)}
          style={{ transformOrigin: `${CENTER}px ${CENTER}px` }}
        />

        {DIMENSIONS.map((dimension, index) => {
          const labelPoint = pointAt(RADIUS + LABEL_OFFSET, index);
          const hitPoint = pointAt(RADIUS, index);
          const anchor = labelAnchor(index);
          const isHovered = hovered === dimension;

          return (
            <g key={dimension}>
              <circle
                cx={hitPoint.x}
                cy={hitPoint.y}
                r={18}
                className="radar-chart-hit"
                onMouseEnter={() => setHovered(dimension)}
                onMouseLeave={() => setHovered((prev) => (prev === dimension ? null : prev))}
                onClick={() => setHovered((prev) => (prev === dimension ? null : dimension))}
              />
              <text x={labelPoint.x} y={labelPoint.y} textAnchor={anchor} className="radar-chart-label">
                {dimension}
              </text>
              {isHovered && (
                <text x={labelPoint.x} y={labelPoint.y + 14} textAnchor={anchor} className="radar-chart-count">
                  {totals[dimension]}/{SCORE_MAX}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default RadarChart;
