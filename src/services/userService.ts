import api from './api';

export type UserRegistrationRequest = {
  password: string;
  email: string;
  firstName: string;
  lastNameP: string;
  lastNameM: string;
  city?: string;
  address?: string;
  phoneNumber?: string;
  hireDate?: string;
  birthDate?: string;
};

export type UserProfile = {
  userId: number;
  fullName: string;
  name: string;
  lastNameP: string;
  lastNameM: string;
  profileImageUrl: string | null;
  hireDate: string | null;
  city: string | null;
  address: string | null;
  email: string;
  phoneNumber: string | null;
  profileImageUploadDate: string | null;
  birthDate: string | null;
  accountStatus: number;
  roles: string | null;
};

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastNameP: string;
  lastNameM: string;
  city?: string;
  address?: string;
  phoneNumber?: string;
  hireDate?: string;
  birthDate?: string;
  isActive: boolean;
  roles?: string[];
};

export const userService = {
  /**
   * Register a new user (Administrator role required)
   */
  registerUser: async (userData: UserRegistrationRequest): Promise<User> => {
    const response = await api.post<User>('/UserAccounts/Administration/Register', userData);
    return response.data;
  },

  /**
   * Get all user profiles with filter
   */
  getAllUserProfiles: async (): Promise<{ data: UserProfile[] }> => {
    const response = await api.get<{ data: UserProfile[] }>('/UserProfiles/GetAllUserProfileFilter');
    return response.data;
  },

  /**
   * Update user (placeholder - adjust endpoint as needed)
   */
  updateUser: async (userId: string, userData: Partial<User>): Promise<User> => {
    const response = await api.put<User>(`/UserAccounts/Update/${userId}`, userData);
    return response.data;
  },

  /**
   * Delete user (placeholder - adjust endpoint as needed)
   */
  deleteUser: async (userId: string): Promise<void> => {
    await api.delete(`/UserAccounts/Delete/${userId}`);
  },
};

export default userService;
