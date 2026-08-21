import { useEffect, useMemo, useRef } from 'react';
import { buildWeeks } from '../../lib/votes';

/*
  GitHub's contribution graph, minus the multi-level shading (this app's
  votes are one-per-day, not a count, so a cell is only ever empty / voted
  / voted-as-milestone) and minus the fixed one-year span -- weeks run from
  the priority's own createdAt through today, so one started last month
  simply has a shorter grid. `maxWeeks` slices to the most recent N columns
  for the card's compact preview; the full detail view omits it and scrolls.
*/
function PriorityVoteGrid({ votes, createdAt, maxWeeks, onSelectVote }) {
  const scrollRef = useRef(null);

  const allWeeks = useMemo(() => buildWeeks(createdAt), [createdAt]);
  const weeks = maxWeeks ? allWeeks.slice(-maxWeeks) : allWeeks;

  const votesByDate = useMemo(() => {
    const map = new Map();
    votes.forEach((vote) => map.set(vote.date, vote));
    return map;
  }, [votes]);

  // Oldest-to-newest left-to-right, like GitHub's own graph, but scrolled
  // to its right edge on mount so "today" -- not the priority's distant
  // start -- is what's actually on screen by default.
  useEffect(() => {
    const node = scrollRef.current;
    if (node) {
      node.scrollLeft = node.scrollWidth;
    }
  }, [weeks.length]);

  return (
    <div className="priority-vote-grid" ref={scrollRef}>
      <div className="priority-vote-grid-columns">
        {weeks.map((week, weekIndex) => (
          <div className="priority-vote-grid-week" key={weekIndex}>
            {week.map((date, dayIndex) => {
              if (!date) {
                return <span className="priority-vote-cell is-pad" key={dayIndex} />;
              }
              const vote = votesByDate.get(date);
              const className = `priority-vote-cell${vote ? ' is-voted' : ''}${vote?.isMilestone ? ' is-milestone' : ''}`;
              // Cell appearance never branches on whether a moment (photo/
              // comment) is attached -- same square either way (see this
              // component's own comment above) -- only the tap behavior
              // does, and only when there's actually something to open.
              const hasMoment = Boolean(vote?.photoUrl || vote?.comment);
              return (
                <span
                  className={className}
                  title={date}
                  key={date}
                  onClick={
                    hasMoment
                      ? (event) => {
                          // The compact card grid sits inside its own
                          // whole-card tap-to-open area (see PriorityCard) --
                          // stop the bubble so tapping a cell opens the
                          // moment instead of also opening the detail modal
                          // underneath it.
                          event.stopPropagation();
                          onSelectVote?.(vote);
                        }
                      : undefined
                  }
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default PriorityVoteGrid;
