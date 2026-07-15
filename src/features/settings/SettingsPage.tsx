import { Box, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { AppDataTable } from '../../components/AppDataTable';
import { EmptyState, ErrorState, LoadingState } from '../../components/StateView';
import { settingsService, type Setting } from '../../services/settingsService';

export function SettingsPage() {
  const settingsQuery = useQuery({ queryKey: ['settings'], queryFn: settingsService.list });

  if (settingsQuery.isLoading) return <LoadingState label="Cargando configuración" />;
  if (settingsQuery.isError) return <ErrorState message="No se pudo cargar la configuración" onRetry={() => settingsQuery.refetch()} />;

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h2">Configuración</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Preferencias de cuenta, notificaciones y flujo de validación.
      </Typography>
      {(settingsQuery.data ?? []).length === 0 ? (
        <EmptyState title="No hay configuración definida" body="La configuración de la organización aparecerá aquí cuando sea creada desde la API del backend." />
      ) : (
        <AppDataTable<Setting>
          rows={settingsQuery.data ?? []}
          emptyLabel="No hay configuración definida"
          columns={[
            { key: 'key', header: 'Clave', render: (row) => row.key },
            { key: 'value', header: 'Valor', render: (row) => JSON.stringify(row.value) },
            { key: 'updatedAt', header: 'Actualizado', render: (row) => new Date(row.updatedAt).toLocaleString() },
          ]}
        />
      )}
    </Box>
  );
}
