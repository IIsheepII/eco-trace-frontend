import { Box, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { AppDataTable } from '../../components/AppDataTable';
import { ErrorState, LoadingState } from '../../components/StateView';
import { adminService } from '../../services/adminService';
import type { AuditEvent } from '../../types/domain';

export function AuditLogPage() {
  const auditQuery = useQuery({ queryKey: ['audit-log'], queryFn: adminService.auditLog });
  if (auditQuery.isLoading) return <LoadingState label="Cargando auditoría" />;
  if (auditQuery.isError) return <ErrorState message="No se pudo cargar la auditoría" onRetry={() => auditQuery.refetch()} />;

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h2">Auditoría</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Trazabilidad completa de acciones sobre documentos, correcciones de datos y cambios del sistema.
      </Typography>
      <AppDataTable<AuditEvent>
        rows={auditQuery.data ?? []}
        emptyLabel="No se encontraron eventos de auditoría"
        columns={[
          { key: 'createdAt', header: 'Fecha', render: (row) => new Date(row.createdAt).toLocaleString() },
          { key: 'actor', header: 'Actor', render: (row) => row.actor },
          { key: 'action', header: 'Acción', render: (row) => row.action },
          { key: 'target', header: 'Destino', render: (row) => row.target },
        ]}
      />
    </Box>
  );
}
