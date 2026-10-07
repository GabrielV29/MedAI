import { api } from './api';

export interface LoginResponse {
  access_token: string;
  token_type: string;
  role: string;
  sub_role?: string;
  full_name: string;
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    
    if (response.data.access_token) {
      localStorage.setItem('medai_token', response.data.access_token);
      localStorage.setItem('medai_user', JSON.stringify(response.data));
    }
    
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('medai_token');
    localStorage.removeItem('medai_user');
  },
};