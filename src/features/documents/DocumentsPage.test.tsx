import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { DocumentsPage } from './DocumentsPage';
import { theme } from '../../theme/theme';
import { httpClient } from '../../services/apiClient';

vi.mock('../auth/AuthProvider', () => ({
  useAuth: () => ({ user: { permissions: ['documents:manage'] } }),
}));

afterEach(() => vi.restoreAllMocks());

describe('DocumentsPage', () => {
  it('renders documents returned by the API', async () => {
    vi.spyOn(httpClient, 'request').mockResolvedValue({
      data: [
        {
          id: 'doc-1',
          title: 'Manifest.pdf',
          status: 'VALIDATION_PENDING',
          metadata: {},
          createdAt: '2026-06-09T10:00:00Z',
          updatedAt: '2026-06-09T10:00:00Z',
          documentType: { id: 'dt-1', name: 'Manifest', code: 'MANIFEST', isActive: true, fieldDefinitions: [] },
          uploadedFile: null,
          extractedFields: [],
          validatedFields: [],
          processingJobs: [],
        },
      ],
    });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <MemoryRouter>
            <DocumentsPage />
          </MemoryRouter>
        </ThemeProvider>
      </QueryClientProvider>,
    );

    await waitFor(() => expect(screen.getByText('Manifest.pdf')).toBeInTheDocument());
  });
});
