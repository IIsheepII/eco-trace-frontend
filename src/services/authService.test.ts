import { afterEach, describe, expect, it, vi } from 'vitest';
import { authService } from './authService';
import { httpClient } from './apiClient';

afterEach(() => vi.restoreAllMocks());

const authResponse = {
  data: {
    user: {
      id: 'u1',
      email: 'admin@eco-trace.local',
      organisationId: 'org-1',
      role: 'admin',
      permissions: ['documents:manage'],
    },
  },
};

describe('authService', () => {
  it('logs in through the cookie-setting backend endpoint and unwraps user', async () => {
    const request = vi.spyOn(httpClient, 'request').mockResolvedValue(authResponse);

    await expect(authService.login({ email: 'admin@eco-trace.local', password: 'Admin123!' })).resolves.toEqual({
      ...authResponse.data.user,
      name: 'admin@eco-trace.local',
    });
    expect(request).toHaveBeenCalledWith(expect.objectContaining({ url: '/auth/login', method: 'POST' }));
  });

  it('loads the current user through the backend refresh endpoint', async () => {
    const request = vi.spyOn(httpClient, 'request').mockResolvedValue(authResponse);

    await authService.me();
    expect(request).toHaveBeenCalledWith(expect.objectContaining({ url: '/auth/refresh', method: 'POST' }));
  });
});
