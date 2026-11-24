const LABELS = {
  connected: 'Live',
  connecting: 'Connecting',
  disconnected: 'Offline',
};

export const ConnectionStatus = ({ status, compact = false }) => {
  const state = LABELS[status] ? status : 'disconnected';

  return (
    <div className={`connection-status status-${state} ${compact ? 'compact' : ''}`}>
      <span className="status-dot" aria-hidden="true" />
      <span className="status-text">{LABELS[state]}</span>
    </div>
  );
};
