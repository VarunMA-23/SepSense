import { useCallback, useEffect, useState } from 'react';
import { apiUrl } from '../config/api';
import { createDemoRecommendations, demoMode } from '../data/demoData';

export const useRecommendations = () => {
  const [recommendations, setRecommendations] = useState(() => demoMode ? createDemoRecommendations() : []);
  const [isConnected, setIsConnected] = useState(demoMode);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (demoMode) return undefined;

    let active = true;

    fetch(apiUrl('/api/clinical-recommendations'))
      .then((response) => response.json())
      .then((data) => {
        if (active) setRecommendations(data);
      })
      .catch((err) => {
        if (active) setError(err);
      });

    const eventSource = new EventSource(apiUrl('/stream/clinical-recommendations'));

    eventSource.addEventListener('connected', () => {
      if (!active) return;
      setIsConnected(true);
      setError(null);
    });

    eventSource.addEventListener('recommendation', (event) => {
      if (!active) return;
      try {
        const recommendation = JSON.parse(event.data);
        setRecommendations((current) => [recommendation, ...current]);
      } catch (err) {
        setError(err);
      }
    });

    eventSource.onerror = (err) => {
      if (!active) return;
      setIsConnected(false);
      setError(err);
    };

    return () => {
      active = false;
      eventSource.close();
    };
  }, []);

  const getRecommendationForAlert = useCallback(
    (subjectId, alertTime) =>
      recommendations.find(
        (recommendation) =>
          recommendation.sepsis_alert?.subject_id === subjectId &&
          Math.abs(new Date(recommendation.sepsis_alert.alert_time) - new Date(alertTime)) < 60000
      ),
    [recommendations]
  );

  return { recommendations, isConnected, error, getRecommendationForAlert };
};
