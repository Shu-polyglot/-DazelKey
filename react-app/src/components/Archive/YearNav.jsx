import { motion } from 'motion/react';
import { spring } from '../../styles/motion';

/*
  A vertical year rail on the story stage's right edge -- closer to the
  Photos-app year scrubber than a tab bar, which is the point: Instagram
  has nothing like this, and a plain row of year pills would have read as
  generic. Compact dots by default (the cinematic photo stays the focus),
  each one revealing its numeral on hover; the selected year's numeral
  stays revealed regardless, so it's always legible which year is showing.
  Mobile has no hover, so its own breakpoint (Archive.css) keeps every
  numeral visible all the time instead.
*/
function YearNav({ years, selectedYear, onSelectYear }) {
  return (
    <nav className="year-nav" aria-label="Browse by year">
      <span className="year-nav-spine" aria-hidden="true" />
      {years.map((year) => {
        const isSelected = year === selectedYear;
        return (
          <motion.button
            key={year}
            type="button"
            className={`year-nav-item${isSelected ? ' is-selected' : ''}`}
            aria-current={isSelected ? 'true' : undefined}
            onClick={() => onSelectYear(year)}
            whileTap={{ scale: 0.9, transition: spring.press }}
          >
            <span className="year-nav-dot" aria-hidden="true" />
            <span className="year-nav-label">{year}</span>
          </motion.button>
        );
      })}
    </nav>
  );
}

export default YearNav;
