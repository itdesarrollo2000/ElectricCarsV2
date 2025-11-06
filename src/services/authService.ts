import axios from 'axios';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  TokenRequest,
  PasswordResetConfirmationRequest,
  PasswordChangeRequest,
} from '../types';

const API_BASE_URL = 'https://movilidadelectrico.azurewebsites.net/api';

// Create a separate axios instance for auth (without token interceptor)
const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

export const authService = {
  /**
   * Login - Authenticate user and get JWT token
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await authApi.post<LoginResponse>(
      '/UserAccounts/Administration/Login',
      credentials
    );
    return response.data;
  },

  /**
   * Register - Create new admin user (requires Administrator role)
   */
  register: async (data: RegisterRequest): Promise<void> => {
    await authApi.post('/UserAccounts/Administration/Register', data);
  },

  /**
   * Refresh Token - Get new access token using refresh token
   */
  refreshToken: async (tokenRequest: TokenRequest): Promise<LoginResponse> => {
    const response = await authApi.post<LoginResponse>(
      '/UserAccounts/RefreshToken',
      tokenRequest
    );
    return response.data;
  },

  /**
   * Logout - Invalidate current token
   */
  logout: async (tokenRequest: TokenRequest): Promise<void> => {
    await authApi.post('/UserAccounts/Logout', tokenRequest);
  },

  /**
   * Request Password Reset - Send password reset email
   */
  requestPasswordReset: async (emailAddress: string): Promise<void> => {
    await authApi.get('/UserAccounts/Administration/RequestPasswordReset', {
      params: { emailAddress },
    });
  },

  /**
   * Password Reset Confirmation - Complete password reset with token
   */
  confirmPasswordReset: async (
    data: PasswordResetConfirmationRequest
  ): Promise<void> => {
    await authApi.post('/UserAccounts/PasswordResetConfirmation', data);
  },

  /**
   * Password Change - Change password for authenticated user
   */
  changePassword: async (data: PasswordChangeRequest): Promise<void> => {
    // This endpoint requires authentication, so we need to use the main api instance
    const token = localStorage.getItem('auth_token');
    await authApi.post('/UserAccounts/PasswordChange', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * Email Confirmation - Confirm user email with token
   */
  confirmEmail: async (userId: string, confirmationToken: string): Promise<void> => {
    await authApi.get('/UserAccounts/EmailConfirmation', {
      params: { userId, confirmationToken },
    });
  },
};

export default authService;
