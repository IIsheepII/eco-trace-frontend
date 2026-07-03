import type { LoginFormValues } from '../schemas/auth';
import type { User } from '../types/domain';
import { apiRequest } from './apiClient';

type AuthResponse = {
  user: {
    id: string;
    email: string;
    organisationId: string;
    role: string;
    permissions: string[];
  };
};

function mapAuthUser(response: AuthResponse): User {
  return {
    ...response.user,
    name: response.user.email,
  };
}

export const authService = {
  login: (payload: LoginFormValues) =>
    apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }).then(mapAuthUser),
  logout: () => apiRequest<void>('/auth/logout', { method: 'POST' }),
  me: () => apiRequest<AuthResponse>('/auth/refresh', { method: 'POST' }).then(mapAuthUser),
};
