import { useEffect, useState } from 'react';
import { useSimulationClock } from '../hooks/useSimulationClock';
import { useTheme } from '../hooks/useTheme';
import { ConnectionStatus } from './ConnectionStatus';
import { ThemeToggle } from './ThemeToggle';

const NAV_ITEMS = [
  { href: '#overview', label: 'Overview' },
  { href: '#signals', label: 'Signals' },
  { href: '#timeline', label: 'Timeline' },
  { href: '#controls', label: 'Controls' },
];

export const Header = ({ overallStatus }) => {
  const { currentTime } = useSimulationClock();
  const { theme, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState(() => window.location.hash || '#overview');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onHashChange = () => setActiveSection(window.location.hash || '#overview');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navLinks = (onNavigate) =>
    NAV_ITEMS.map((item) => (
      <a
        key={item.href}
        href={item.href}
        className={`nav-link ${activeSection === item.href ? 'active' : ''}`}
        aria-current={activeSection === item.href ? 'page' : undefined}
        onClick={() => onNavigate?.(item.href)}
      >
        {item.label}
      </a>
    ));

  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="wordmark" href="#overview" aria-label="Sepsense home">
          Sepsense<span>.</span>
        </a>

        <nav className="desktop-nav" aria-label="Primary">
          {navLinks()}
        </nav>

        <div className="header-actions">
          <ConnectionStatus status={overallStatus} compact />
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          <button
            type="button"
            className="icon-button menu-button"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d={menuOpen ? 'M18 6 6 18M6 6l12 12' : 'M4 7h16M4 12h16M4 17h16'} />
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="mobile-menu" className="mobile-nav" aria-label="Mobile">
          {navLinks((href) => {
            setActiveSection(href);
            setMenuOpen(false);
          })}
          {currentTime && <span className="mobile-clock">Sim time · {currentTime}</span>}
        </nav>
      )}
    </header>
  );
};
