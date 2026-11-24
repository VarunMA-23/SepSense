import { useEffect, useState } from 'react';
import { apiUrl } from '../config/api';
import { demoMode } from '../data/demoData';
import { useSimulationClock } from '../hooks/useSimulationClock';

const EMPTY_STATUS = {
  status: 'stopped',
  running: false,
  tick_count: 0,
  config: null,
  totals: {},
};

const DEMO_STATUS = {
  status: 'demo',
  running: true,
  tick_count: 24,
  config: null,
  totals: {},
};

export const SimulationControl = ({ onClearData }) => {
  const { currentTime, tickSizeMinutes } = useSimulationClock();
  const [subjectIds, setSubjectIds] = useState('10000032, 10000980');
  const [startTime, setStartTime] = useState('2110-01-01 00:00:00');
  const [tickMinutes, setTickMinutes] = useState(15);
  const [tickInterval, setTickInterval] = useState(2);
  const [maxTicks, setMaxTicks] = useState('');
  const [status, setStatus] = useState(demoMode ? DEMO_STATUS : EMPTY_STATUS);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (demoMode) return undefined;

    let active = true;

    const refresh = async () => {
      try {
        const response = await fetch(apiUrl('/api/simulation/status'));
        if (!response.ok) return;
        const data = await response.json();
        if (active) setStatus(data);
      } catch {
        if (active) setStatus(EMPTY_STATUS);
      }
    };

    refresh();
    const interval = setInterval(refresh, 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const readError = async (response) => {
    try {
      const data = await response.json();
      return data.detail || `Request failed (${response.status})`;
    } catch {
      return `Request failed (${response.status})`;
    }
  };

  const start = async (event) => {
    event.preventDefault();
    if (demoMode) {
      setMessage('Demo mode is active. Set VITE_DEMO_MODE=false to use the live stream.');
      return;
    }
    const ids = subjectIds
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number)
      .filter((id) => Number.isInteger(id));

    if (ids.length === 0) {
      setError('Enter at least one numeric patient ID.');
      return;
    }

    setBusy(true);
    setError('');
    setMessage('Starting simulation…');

    try {
      const response = await fetch(apiUrl('/api/simulation/start'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject_ids: ids,
          start_time: startTime.trim(),
          tick_minutes: Number(tickMinutes),
          tick_interval: Number(tickInterval),
          max_ticks: maxTicks.trim() === '' ? null : Number(maxTicks),
        }),
      });

      if (!response.ok) throw new Error(await readError(response));
      setMessage('Simulation running. Events will appear on the timeline.');
      setStatus((current) => ({ ...current, status: 'running', running: true }));
    } catch (err) {
      setError(err.message);
      setMessage('');
    } finally {
      setBusy(false);
    }
  };

  const stop = async () => {
    if (demoMode) {
      setMessage('Demo data stays loaded. Set VITE_DEMO_MODE=false to control the live stream.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const response = await fetch(apiUrl('/api/simulation/stop'), { method: 'POST' });
      if (!response.ok) throw new Error(await readError(response));
      setMessage('Simulation stopped.');
      setStatus((current) => ({ ...current, status: 'stopped', running: false }));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const tick = async () => {
    if (demoMode) {
      setMessage('Demo clock is fixed. Set VITE_DEMO_MODE=false to advance the live clock.');
      return;
    }
    try {
      const response = await fetch(apiUrl('/clock/tick'), { method: 'POST' });
      if (!response.ok) throw new Error(await readError(response));
      setMessage('Clock advanced by one window.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="control-card" id="controls">
      <div className="control-heading">
        <span className="micro-label">Simulation</span>
        <h2>Drive the stream</h2>
        <p>Replay a small set of patient records through the pipeline.</p>
      </div>

      <div className="clock-strip">
        <div>
          <span className="micro-label">Simulation clock</span>
          <strong>{currentTime || 'Waiting for clock'}</strong>
        </div>
        <span className="clock-chip">{tickSizeMinutes || tickMinutes} min tick</span>
      </div>

      <form onSubmit={start} className="control-form">
        <label>
          <span>Patient IDs</span>
          <input
            type="text"
            value={subjectIds}
            onChange={(event) => setSubjectIds(event.target.value)}
            placeholder="10000032, 10000980"
          />
        </label>

        <label>
          <span>Start time</span>
          <input
            type="text"
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
            placeholder="YYYY-MM-DD HH:MM:SS"
          />
        </label>

        <div className="form-row">
          <label>
            <span>Tick minutes</span>
            <input
              type="number"
              min="1"
              value={tickMinutes}
              onChange={(event) => setTickMinutes(event.target.value)}
            />
          </label>
          <label>
            <span>Interval (s)</span>
            <input
              type="number"
              min="0.5"
              step="0.5"
              value={tickInterval}
              onChange={(event) => setTickInterval(event.target.value)}
            />
          </label>
        </div>

        <label>
          <span>Max ticks <em>optional</em></span>
          <input
            type="number"
            min="1"
            value={maxTicks}
            onChange={(event) => setMaxTicks(event.target.value)}
            placeholder="Unlimited"
          />
        </label>

        <div className="control-actions">
          <button type="submit" className="pill-button primary" disabled={busy || status.running}>
            Start stream
          </button>
          <button type="button" className="pill-button secondary" onClick={stop} disabled={busy || !status.running}>
            Stop
          </button>
          <button type="button" className="pill-button ghost" onClick={tick}>
            Tick
          </button>
        </div>
      </form>

      <div className="control-meta">
        <span className={`run-badge ${status.running ? 'running' : ''}`}>
          {status.running ? 'Running' : 'Idle'}
        </span>
        <span>{status.tick_count || 0} ticks emitted</span>
      </div>

      <button type="button" className="text-button" onClick={onClearData}>
        Clear dashboard data
      </button>

      {message && <p className="control-message success">{message}</p>}
      {error && <p className="control-message error" role="alert">{error}</p>}
    </section>
  );
};
