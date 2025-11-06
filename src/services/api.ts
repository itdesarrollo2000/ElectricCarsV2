import axios from 'axios';
import { getAuthToken } from '../contexts/AuthContext';
import { setupTokenRefreshInterceptor } from './tokenRefreshInterceptor';

const API_BASE_URL = 'https://movilidadelectrico.azurewebsites.net/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - Add JWT token to all requests
api.interceptors.request.use(
  (config) => {
    // Get token from AuthContext/localStorage
    const token = getAuthToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Setup token refresh interceptor (handles 401 errors and automatic token refresh)
setupTokenRefreshInterceptor(api);

// Additional response interceptor - Handle other errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle errors globally (401 is handled by tokenRefreshInterceptor)
    if (error.response) {
      const { status, data } = error.response;

      // Only log real errors, not empty table responses (400 with errorCode 2)
      const isEmptyTableError = status === 400 && data?.errorCode === 2;

      if (!isEmptyTableError && status !== 401) {
        console.error('API Error:', status, data);
      }

      // Handle forbidden errors
      if (status === 403) {
        console.error('Forbidden - insufficient permissions');
      }
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.request);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
