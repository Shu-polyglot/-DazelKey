import { useMemo } from 'react';
import './OverviewPanel.css';

function OverviewPanel({ buckets }) {
  const stats = useMemo(() => {
    const completed = buckets.filter((bucket) => bucket.status === 'completed').length;
    const inProgress = buckets.filter((bucket) => bucket.status === 'in-progress').length;
    const total = buckets.length;
    const percentage = total ? Math.round((completed / total) * 100) : 0;

    return { completed, inProgress, total, percentage };
  }, [buckets]);

  return (
    <section className="panel overview-panel">
      <p className="panel-label">Archive overview</p>

      <div className="overview-body">
        <div className="overview-count">
          <span className="overview-number">{stats.completed}</span>
          <span className="overview-caption">experiences archived</span>
          {stats.inProgress > 0 && <span className="overview-secondary">{stats.inProgress} in motion</span>}
        </div>

        <div
          className="ring"
          style={{
            background: `conic-gradient(var(--color-accent) 0 ${stats.percentage}%, rgba(214, 201, 184, 0.1) ${stats.percentage}% 100%)`,
          }}
          aria-label={`${stats.percentage} percent of the archive complete`}
        >
          <span>{stats.percentage}%</span>
        </div>
      </div>
    </section>
  );
}

export default OverviewPanel;
