import { useEffect, useState } from 'react';
import { apiUrl } from '../config/api';
import { DEMO_CLOCK_TIME, demoMode } from '../data/demoData';
import { ClockContext } from './clock';

export const ClockProvider = ({ children }) => {
  const [currentTime, setCurrentTime] = useState(demoMode ? DEMO_CLOCK_TIME : null);
  const [isRunning, setIsRunning] = useState(demoMode);
  const [tickSizeMinutes, setTickSizeMinutes] = useState(10);
  const [tickIntervalSeconds, setTickIntervalSeconds] = useState(2);

  useEffect(() => {
    if (demoMode) return undefined;

    let active = true;

    const fetchClock = async () => {
      try {
        const response = await fetch(apiUrl('/clock/status'));
        if (!response.ok || !active) return;
        const data = await response.json();
        setCurrentTime(data.current_time);
        setIsRunning(data.is_running);
        setTickSizeMinutes(data.tick_size_minutes);
        setTickIntervalSeconds(data.tick_interval_seconds || 2);
      } catch {
        if (active) setCurrentTime(null);
      }
    };

    fetchClock();
    const interval = setInterval(fetchClock, Math.max(500, tickIntervalSeconds * 1000));
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [tickIntervalSeconds]);

  return (
    <ClockContext.Provider value={{ currentTime, isRunning, tickSizeMinutes, tickIntervalSeconds }}>
      {children}
    </ClockContext.Provider>
  );
};
