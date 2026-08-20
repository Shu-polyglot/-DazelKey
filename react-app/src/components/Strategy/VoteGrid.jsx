import { useEffect, useMemo, useRef } from 'react';
import { buildWeeks } from '../../lib/votes';

/*
  GitHub's contribution graph, minus the multi-level shading (this app's
  votes are one-per-day, not a count, so a cell is only ever empty / voted
  / voted-as-milestone) and minus the fixed one-year span -- weeks run from
  the goal's own createdAt through today, so a goal started last month
  simply has a shorter grid. `maxWeeks` slices to the most recent N columns
  for the card's compact preview; the full detail view omits it and scrolls.
*/
function VoteGrid({ votes, createdAt, maxWeeks }) {
  const scrollRef = useRef(null);

  const allWeeks = useMemo(() => buildWeeks(createdAt), [createdAt]);
  const weeks = maxWeeks ? allWeeks.slice(-maxWeeks) : allWeeks;

  const votesByDate = useMemo(() => {
    const map = new Map();
    votes.forEach((vote) => map.set(vote.date, vote));
    return map;
  }, [votes]);

  // Oldest-to-newest left-to-right, like GitHub's own graph, but scrolled
  // to its right edge on mount so "today" -- not the goal's distant start
  // -- is what's actually on screen by default.
  useEffect(() => {
    const node = scrollRef.current;
    if (node) {
      node.scrollLeft = node.scrollWidth;
    }
  }, [weeks.length]);

  return (
    <div className="vote-grid" ref={scrollRef}>
      <div className="vote-grid-columns">
        {weeks.map((week, weekIndex) => (
          <div className="vote-grid-week" key={weekIndex}>
            {week.map((date, dayIndex) => {
              if (!date) {
                return <span className="vote-cell is-pad" key={dayIndex} />;
              }
              const vote = votesByDate.get(date);
              const className = `vote-cell${vote ? ' is-voted' : ''}${vote?.isMilestone ? ' is-milestone' : ''}`;
              return <span className={className} title={date} key={date} />;
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default VoteGrid;
