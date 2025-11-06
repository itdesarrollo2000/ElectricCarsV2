import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { App } from 'antd';
import authService from '../services/authService';
import { extractUserFromJWT } from '../utils/jwtUtils';

// Auth types
export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
}

export interface LoginCredentials {
  username: string; // Can be email or username
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
  expiresIn?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  refreshAuthToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local storage keys
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const USER_KEY = 'auth_user';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { message } = App.useApp();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshTokenState, setRefreshTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (storedToken && storedUser) {
          // Validate token is not expired
          const userData = extractUserFromJWT(storedToken);

          if (userData) {
            // Token is valid, restore session
            setToken(storedToken);
            setRefreshTokenState(storedRefreshToken);
            setUser(JSON.parse(storedUser));
            console.log('Session restored from localStorage');
          } else {
            // Token is invalid or expired, try to refresh
            console.log('Token expired, attempting refresh...');

            if (storedRefreshToken) {
              try {
                const response = await authService.refreshToken({
                  token: storedToken,
                  refreshToken: storedRefreshToken,
                });

                if (response.token && response.refreshToken) {
                  const newUserData = extractUserFromJWT(response.token);

                  if (newUserData) {
                    const newUser = {
                      id: newUserData.id,
                      email: newUserData.email,
                      name: newUserData.name,
                      roles: newUserData.roles,
                    };

                    // Update storage and state
                    localStorage.setItem(TOKEN_KEY, response.token);
                    localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
                    localStorage.setItem(USER_KEY, JSON.stringify(newUser));

                    setToken(response.token);
                    setRefreshTokenState(response.refreshToken);
                    setUser(newUser);
                    console.log('Session refreshed successfully');
                  } else {
                    throw new Error('Invalid token after refresh');
                  }
                } else {
                  throw new Error('Invalid refresh response');
                }
              } catch (refreshError) {
                console.error('Failed to refresh token on init:', refreshError);
                // Clear invalid data
                localStorage.removeItem(TOKEN_KEY);
                localStorage.removeItem(REFRESH_TOKEN_KEY);
                localStorage.removeItem(USER_KEY);
              }
            } else {
              // No refresh token, clear everything
              localStorage.removeItem(TOKEN_KEY);
              localStorage.removeItem(REFRESH_TOKEN_KEY);
              localStorage.removeItem(USER_KEY);
            }
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear invalid data
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);

      // Call real API - send username directly
      const response = await authService.login({
        userName: credentials.username,
        password: credentials.password,
      });

      // Check if login was successful
      if (!response.success) {
        // Handle different error formats
        let errorMsg = 'Usuario o contraseña incorrecta';

        if (response.errors) {
          // errors can be array or object
          if (Array.isArray(response.errors)) {
            errorMsg = response.errors.join(', ') || errorMsg;
          } else if (typeof response.errors === 'object') {
            // Extract error messages from object
            const errorMessages = Object.values(response.errors);
            errorMsg = errorMessages.join(', ') || errorMsg;
          }
        }

        throw new Error(errorMsg);
      }

      // Validate that we have tokens
      if (!response.token || !response.refreshToken) {
        throw new Error('Respuesta inválida del servidor');
      }

      // Extract tokens from response (now guaranteed to be strings)
      const newToken = response.token;
      const refreshToken = response.refreshToken;

      // Extract user data from JWT token
      const userData = extractUserFromJWT(newToken);

      if (!userData) {
        throw new Error('Error al procesar la información del usuario');
      }

      // Build user object from JWT payload
      const newUser: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        roles: userData.roles,
      };

      // Store auth data
      localStorage.setItem(TOKEN_KEY, newToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));

      setToken(newToken);
      setRefreshTokenState(refreshToken);
      setUser(newUser);

      message.success(`Bienvenido, ${newUser.name}!`);
    } catch (error: any) {
      console.error('Login error:', error);
      console.log('Login error full details:', {
        message: error.message,
        response: error.response,
        data: error.response?.data
      });

      // Handle specific error messages
      let errorMessage = 'Usuario o contraseña incorrecta';

      // Check if it's an error from our validation (thrown by us)
      if (error.message && !error.response) {
        errorMessage = error.message;
      }
      // Check if it's an axios error with response
      else if (error.response) {
        const { status, data } = error.response;

        console.log('Response data:', data);
        console.log('Response status:', status);

        // Check for error structure: { success: false, errors: {...} }
        if (data?.success === false && data?.errors) {
          if (typeof data.errors === 'object' && !Array.isArray(data.errors)) {
            // Extract error messages from object
            const errorMessages = Object.values(data.errors);
            console.log('Extracted error messages from object:', errorMessages);
            errorMessage = errorMessages.join(', ') || errorMessage;
          } else if (Array.isArray(data.errors)) {
            console.log('Extracted error messages from array:', data.errors);
            errorMessage = data.errors.join(', ') || errorMessage;
          }
        }
        // 401 Unauthorized
        else if (status === 401) {
          errorMessage = 'Usuario o contraseña incorrecta';
        }
        // Other server errors
        else if (data?.message) {
          errorMessage = data.message;
        } else if (data?.title) {
          errorMessage = data.title;
        }
      }

      console.log('Final error message to display:', errorMessage);
      message.error({
        content: errorMessage,
        duration: 6,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Get tokens for logout request
      const currentToken = localStorage.getItem(TOKEN_KEY);
      const currentRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      // Call API to invalidate token (optional, best practice)
      if (currentToken && currentRefreshToken) {
        try {
          await authService.logout({
            token: currentToken,
            refreshToken: currentRefreshToken,
          });
        } catch (error) {
          console.error('Error during logout API call:', error);
          // Continue with local cleanup even if API call fails
        }
      }
    } finally {
      // Clear auth data locally (always execute)
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);

      setToken(null);
      setRefreshTokenState(null);
      setUser(null);

      message.info('Sesión cerrada exitosamente');
    }
  };

  const refreshAuthToken = async (): Promise<string> => {
    try {
      const currentToken = token || localStorage.getItem(TOKEN_KEY);
      const currentRefreshToken = refreshTokenState || localStorage.getItem(REFRESH_TOKEN_KEY);

      if (!currentToken || !currentRefreshToken) {
        throw new Error('No tokens available for refresh');
      }

      // Call refresh token API
      const response = await authService.refreshToken({
        token: currentToken,
        refreshToken: currentRefreshToken,
      });

      // Validate response has tokens
      if (!response.token || !response.refreshToken) {
        throw new Error('Respuesta inválida del servidor');
      }

      // Update tokens (now guaranteed to be strings)
      const newToken = response.token;
      const newRefreshToken = response.refreshToken;

      localStorage.setItem(TOKEN_KEY, newToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);

      setToken(newToken);
      setRefreshTokenState(newRefreshToken);

      return newToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Force logout on refresh failure
      await logout();
      throw error;
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  };

  const value: AuthContextType = {
    user,
    token,
    refreshToken: refreshTokenState,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
    updateUser,
    refreshAuthToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to get token (for use in API interceptors)
export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

// Helper function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem(TOKEN_KEY);
  const user = localStorage.getItem(USER_KEY);
  return !!token && !!user;
};

export default AuthContext;
