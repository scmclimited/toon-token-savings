// API configuration
// In Docker, the nginx proxy forwards /api requests to the backend
// In development, we use localhost:8000 directly
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8000');

export default {
  API_BASE_URL,
};

