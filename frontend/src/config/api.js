const DEFAULT_API_URL = 'http://localhost:8000';

export const getApiUrl = () => (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/$/, '');

export const apiUrl = (path) => `${getApiUrl()}${path}`;
