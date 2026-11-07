import axios from 'axios';

export const getBaseApiUrl = () => {
  let url = (import.meta.env.VITE_API_URL || '').trim();

  // If not configured in production, use the current origin
  if (!url) {
    if (
      typeof window !== 'undefined' &&
      window.location.origin &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    ) {
      url = `${window.location.origin}/api/v1`;
    } else {
      url = 'http://localhost:5000/api/v1';
    }
  }

  // Strip trailing slashes
  url = url.replace(/\/+$/, '');

  // Guarantee /api/v1 prefix
  if (!url.endsWith('/api/v1')) {
    url = `${url}/api/v1`;
  }

  return url;
};

const api = axios.create({
  baseURL: getBaseApiUrl(),
  headers: { 'Content-Type': 'application/json' },
});

export default api;

