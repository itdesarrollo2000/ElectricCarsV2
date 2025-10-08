import axios from 'axios';

const API_BASE_URL = 'https://movilidadelectrico.azurewebsites.net/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle errors globally
    if (error.response) {
      // Server responded with error
      // Only log real errors, not empty table responses (400 with errorCode 2)
      const isEmptyTableError = error.response.status === 400 &&
        error.response.data?.errorCode === 2;

      if (!isEmptyTableError) {
        console.error('API Error:', error.response.status, error.response.data);
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
