import { useMemo } from 'react';
import { useMultiStreamSSE } from './hooks/useMultiStreamSSE';
import { Header } from './components/Header';
import { SimulationControl } from './components/SimulationControl';
import { StatsGrid } from './components/StatsGrid';
import { RiskGauge } from './components/RiskGauge';
import { TimelineLegend } from './components/TimelineLegend';
import TimelineContainer from './components/Timeline/TimelineContainer';
import ErrorBoundary from './components/ErrorBoundary';
import { ClockProvider } from './contexts/ClockProvider';
import { getApiUrl } from './config/api';
import { demoMode } from './data/demoData';
import './App.css';

const STREAMS = ['admissions', 'labs', 'icu', 'vitals', 'sepsisAlerts'];

function App() {
  const apiUrl = getApiUrl();
  const { patients, connectionStatus, clearPatients } = useMultiStreamSSE(
    `${apiUrl}/stream/admissions`,
    `${apiUrl}/stream/labs`,
    `${apiUrl}/stream/icu-admissions`,
    `${apiUrl}/stream/vitals`,
    `${apiUrl}/stream/sepsis-alerts`,
    20
  );

  const stats = useMemo(() => {
    const admissions = patients.reduce((sum, patient) => sum + patient.admissions.length, 0);
    const labs = patients.reduce((sum, patient) => sum + patient.labs.length, 0);
    const icuPatients = patients.filter((patient) => patient.icuStays?.length > 0).length;
    const abnormalLabs = patients.reduce(
      (sum, patient) =>
        sum + patient.labs.filter((lab) => lab.lab.flag?.toUpperCase() === 'ABNORMAL').length,
      0
    );
    const sepsisAlerts = patients.reduce((sum, patient) => sum + (patient.sepsisAlerts?.length || 0), 0);
    const criticalSepsisAlerts = patients.reduce(
      (sum, patient) =>
        sum +
        patient.sepsisAlerts?.filter((alert) =>
          ['CRITICAL', 'HIGH'].includes(alert.prediction?.risk_level)
        ).length,
      0
    );

    return {
      patients: patients.length,
      admissions,
      labs,
      icuPatients,
      abnormalLabs,
      sepsisAlerts,
      criticalSepsisAlerts: criticalSepsisAlerts || 0,
    };
  }, [patients]);

  const overallStatus = STREAMS.every((stream) => connectionStatus[stream] === 'connected')
    ? 'connected'
    : STREAMS.some((stream) => connectionStatus[stream] === 'connecting')
      ? 'connecting'
      : 'disconnected';

  return (
    <ClockProvider>
      <div className="app-shell">
        <a className="skip-link" href="#main-content">Skip to content</a>
        <Header overallStatus={overallStatus} />

        <main id="main-content">
          <section className="hero section" id="overview">
            <div className="hero-copy">
              <span className="eyebrow-pill">Prototype · Clinical signal monitoring</span>
              <h1>
                See sepsis risk <span className="accent-text">as it unfolds.</span>
              </h1>
              <p className="hero-tagline">
                A small, fast dashboard that turns streaming admissions, vitals and labs into a
                patient timeline with real-time risk signals.
              </p>
              <div className="hero-actions">
                <a className="pill-button primary" href="#timeline">View live timeline</a>
                <a className="pill-button secondary" href="#controls">Configure simulation</a>
              </div>
              <div className="hero-meta">
                <span className="status-dot connected" aria-hidden="true" />
                XGBoost · 23 clinical features · SSE updates
                {demoMode && <span className="demo-pill">Demo data</span>}
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-blob" aria-hidden="true" />
              <div className="hero-panel">
                <span className="micro-label">Risk overview</span>
                <RiskGauge alerts={stats.sepsisAlerts} critical={stats.criticalSepsisAlerts} />
                <div className="hero-panel-caption">
                  <strong>{stats.criticalSepsisAlerts}</strong> high or critical alerts
                </div>
              </div>
              <div className="floating-chip chip-top">
                <strong>{stats.patients}</strong>
                <span>patients tracked</span>
              </div>
              <div className="floating-chip chip-bottom">
                <strong>{stats.labs}</strong>
                <span>labs received</span>
              </div>
            </div>
          </section>

          <section className="section signals-section" id="signals">
            <div className="section-heading">
              <div>
                <span className="micro-label">Live signals</span>
                <h2>What the stream is telling us</h2>
              </div>
              <p>Counts update as events arrive from the pipeline.</p>
            </div>
            <StatsGrid stats={stats} />
          </section>

          <section className="section timeline-section" id="timeline">
            <div className="section-heading">
              <div>
                <span className="micro-label">Patient timeline</span>
                <h2>Follow every patient, hour by hour</h2>
              </div>
              <p>Click a row to open labs, vitals, risk history and recommendations.</p>
            </div>

            <div className="dashboard-layout">
              <div className="dashboard-primary">
                <ErrorBoundary>
                  <TimelineContainer patients={patients} />
                </ErrorBoundary>
                <TimelineLegend />
              </div>
              <aside className="dashboard-sidebar">
                <SimulationControl onClearData={clearPatients} />
              </aside>
            </div>
          </section>
        </main>

        <footer className="site-footer">
          <div className="footer-inner">
            <div>
              <a className="wordmark" href="#overview">Sepsense<span>.</span></a>
              <p>Early warning signals for a very small clinical team.</p>
            </div>
            <div className="footer-links">
              <a href="#overview">Overview</a>
              <a href="#signals">Signals</a>
              <a href="#timeline">Timeline</a>
              <a href="#controls">Controls</a>
            </div>
          </div>
          <div className="footer-bottom">© 2026 Sepsense. Prototype build.</div>
        </footer>
      </div>
    </ClockProvider>
  );
}

export default App;
