import { useContext } from 'react';
import { ClockContext } from '../contexts/clock';

export const useSimulationClock = () => {
  const context = useContext(ClockContext);
  if (!context) {
    throw new Error('useSimulationClock must be used within ClockProvider');
  }
  return context;
};
