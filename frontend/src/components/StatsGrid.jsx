const StatCard = ({ label, value, hint, tone = 'default', progress }) => (
  <article className={`stat-card tone-${tone}`}>
    <span className="micro-label">{label}</span>
    <strong className="stat-number">{value}</strong>
    <span className="stat-hint">{hint}</span>
    {progress !== undefined && (
      <div className="progress-track" aria-hidden="true">
        <div className="progress-fill" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
      </div>
    )}
  </article>
);

export const StatsGrid = ({ stats }) => (
  <div className="stats-grid">
    <StatCard label="Patients" value={stats.patients} hint="tracked in this session" tone="sky" />
    <StatCard label="Admissions" value={stats.admissions} hint="events received" />
    <StatCard label="ICU Patients" value={stats.icuPatients} hint="with an ICU stay" tone="peach" />
    <StatCard label="Lab Results" value={stats.labs} hint="streamed so far" />
    <StatCard
      label="Abnormal Labs"
      value={stats.abnormalLabs}
      hint="flagged by the source"
      tone="mint"
      progress={stats.labs ? (stats.abnormalLabs / stats.labs) * 100 : 0}
    />
    <StatCard
      label="Sepsis Alerts"
      value={stats.sepsisAlerts}
      hint={`${stats.criticalSepsisAlerts} high or critical`}
      tone={stats.criticalSepsisAlerts > 0 ? 'danger' : 'default'}
      progress={stats.sepsisAlerts ? (stats.criticalSepsisAlerts / stats.sepsisAlerts) * 100 : 0}
    />
  </div>
);
