import { api } from './instance';
import type { LoginData, RegisterData, TokenResponse } from './types';

export const authApi = {
  login: async (data: LoginData): Promise<TokenResponse> => {
    const formData = new FormData();
    formData.append('username', data.email);
    formData.append('password', data.password);

    const response = await api.post<TokenResponse>('/api/v1/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  register: async (data: RegisterData): Promise<void> => {
    await api.post('/api/v1/users', {
      email: data.email,
      password: data.password,
      is_active: true
    });
  },
};