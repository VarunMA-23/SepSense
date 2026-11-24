const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const RiskGauge = ({ alerts, critical }) => {
  const share = alerts > 0 ? critical / alerts : 0;
  const arc = CIRCUMFERENCE * share;

  return (
    <div className="risk-gauge" role="img" aria-label={`${critical} high or critical alerts out of ${alerts} total`}>
      <svg viewBox="0 0 120 120" className="gauge-ring" aria-hidden="true">
        <circle cx="60" cy="60" r={RADIUS} className="gauge-track" />
        <circle
          cx="60"
          cy="60"
          r={RADIUS}
          className="gauge-value"
          strokeDasharray={`${arc} ${CIRCUMFERENCE - arc}`}
        />
      </svg>
      <div className="gauge-center">
        <strong>{alerts}</strong>
        <span>Alerts</span>
      </div>
    </div>
  );
};
