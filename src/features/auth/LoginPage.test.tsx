import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from './AuthProvider';
import { LoginPage } from './LoginPage';
import { theme } from '../../theme/theme';
import { httpClient } from '../../services/apiClient';

afterEach(() => {
  vi.restoreAllMocks();
});

function renderLogin() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <MemoryRouter>
            <LoginPage />
          </MemoryRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>,
  );
}

describe('LoginPage', () => {
  it('posts credentials using the credentialed Axios client', async () => {
    const requestMock = vi
      .spyOn(httpClient, 'request')
      .mockRejectedValueOnce(new Error('Unauthorized'))
      .mockResolvedValueOnce({
        data: {
          user: {
            id: 'u1',
            email: 'alex@avka.test',
            organisationId: 'org-1',
            role: 'admin',
            permissions: ['documents:manage'],
          },
        },
      });
    renderLogin();

    fireEvent.change(screen.getByLabelText(/work email/i), { target: { value: 'alex@avka.test' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() =>
      expect(requestMock).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/auth/login',
          method: 'POST',
          data: JSON.stringify({ email: 'alex@avka.test', password: 'password123' }),
        }),
      ),
    );
    expect(httpClient.defaults.withCredentials).toBe(true);
  });
});
