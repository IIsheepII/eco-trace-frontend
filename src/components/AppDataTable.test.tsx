import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppDataTable } from './AppDataTable';
import { renderWithProviders } from '../tests/renderWithProviders';

describe('AppDataTable', () => {
  it('renders rows with accessible table semantics', () => {
    renderWithProviders(
      <AppDataTable
        rows={[{ id: '1', name: 'EPA-Form-8700-22.pdf' }]}
        emptyLabel="No hay documentos"
        columns={[{ key: 'name', header: 'Documento', render: (row) => row.name }]}
      />,
    );

    expect(screen.getByRole('table', { name: 'No hay documentos' })).toBeInTheDocument();
    expect(screen.getByText('EPA-Form-8700-22.pdf')).toBeInTheDocument();
  });
});
