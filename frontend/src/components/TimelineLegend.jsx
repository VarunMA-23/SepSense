const CARE_LEVELS = [
  { label: 'Emergency / Urgent', color: 'var(--color-emergency)', shape: 'box' },
  { label: 'Elective', color: 'var(--color-normal)', shape: 'box' },
  { label: 'Observation', color: 'var(--color-observation)', shape: 'box' },
  { label: 'ICU stay', color: 'var(--color-urgent)', shape: 'box' },
];

const EVENTS = [
  { label: 'Lab result', color: '#6366f1', mark: 'L' },
];

const RISK_LEVELS = [
  { label: 'Critical · >70%', color: 'var(--color-emergency)' },
  { label: 'High · 50–70%', color: 'var(--color-urgent)' },
  { label: 'Medium · 30–50%', color: 'var(--color-star)' },
  { label: 'Low · <30%', color: '#84cc16' },
];

export const TimelineLegend = () => (
  <section className="legend-panel" aria-label="Timeline legend">
    <div className="legend-section">
      <span className="micro-label">Care levels</span>
      <div className="legend-items">
        {CARE_LEVELS.map((item) => (
          <span className="legend-item" key={item.label}>
            <i className={`legend-swatch ${item.shape}`} style={{ background: item.color }} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
    <div className="legend-section">
      <span className="micro-label">Events</span>
      <div className="legend-items">
        {EVENTS.map((item) => (
          <span className="legend-item" key={item.label}>
            <i className="legend-swatch circle" style={{ background: item.color }}>{item.mark}</i>
            {item.label}
          </span>
        ))}
      </div>
    </div>
    <div className="legend-section">
      <span className="micro-label">Sepsis risk</span>
      <div className="legend-items">
        {RISK_LEVELS.map((item) => (
          <span className="legend-item" key={item.label}>
            <i className="legend-swatch circle" style={{ background: item.color }}>S</i>
            {item.label}
          </span>
        ))}
      </div>
    </div>
  </section>
);
