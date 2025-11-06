import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import authService from './authService';

// Queue to store failed requests while refreshing token
interface FailedQueue {
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}

let isRefreshing = false;
let failedQueue: FailedQueue[] = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

export const setupTokenRefreshInterceptor = (axiosInstance: AxiosInstance) => {
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      // Check if error is 401 and we haven't already tried to refresh
      if (error.response?.status === 401 && !originalRequest._retry) {
        // Check if we're not on the login page
        if (window.location.pathname.includes('/login')) {
          return Promise.reject(error);
        }

        // If already refreshing, queue this request
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return axiosInstance(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const currentToken = localStorage.getItem('auth_token');
        const currentRefreshToken = localStorage.getItem('auth_refresh_token');

        if (!currentToken || !currentRefreshToken) {
          // No tokens available, clear everything and redirect
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_refresh_token');
          localStorage.removeItem('auth_user');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        try {
          // Call refresh token endpoint
          const response = await authService.refreshToken({
            token: currentToken,
            refreshToken: currentRefreshToken,
          });

          // Validate response has tokens
          if (!response.token || !response.refreshToken) {
            throw new Error('Invalid refresh token response');
          }

          const newToken = response.token;
          const newRefreshToken = response.refreshToken;

          // Update tokens in localStorage
          localStorage.setItem('auth_token', newToken);
          localStorage.setItem('auth_refresh_token', newRefreshToken);

          // Update authorization header
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }

          // Process queued requests
          processQueue(null, newToken);

          // Retry original request
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear auth and redirect to login
          processQueue(refreshError as AxiosError, null);

          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_refresh_token');
          localStorage.removeItem('auth_user');

          window.location.href = '/login';

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // For other errors or if refresh was already attempted, reject
      return Promise.reject(error);
    }
  );
};
