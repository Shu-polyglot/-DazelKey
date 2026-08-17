import { getBucketMatchesForDate } from '../../lib/calendar';
import { getStatusLabel } from '../../lib/buckets';
import { formatDate } from '../../lib/dates';

function CalendarDayDetails({ selectedDate, buckets, onOpenBucket }) {
  const matches = selectedDate ? getBucketMatchesForDate(buckets, selectedDate) : [];

  return (
    <div className="calendar-details" aria-live="polite">
      <h3>{selectedDate ? formatDate(selectedDate) : 'Life moments'}</h3>
      <ul>
        {matches.length === 0 ? (
          <li>Nothing happened this day.</li>
        ) : (
          matches.map((bucket) => (
            <li key={bucket.id} data-status={getStatusLabel(bucket)}>
              <button type="button" className="day-link" onClick={() => onOpenBucket(bucket.id)}>
                {bucket.title}
              </button>{' '}
              · {getStatusLabel(bucket)}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default CalendarDayDetails;
