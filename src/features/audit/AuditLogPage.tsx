import { Box, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { AppDataTable } from '../../components/AppDataTable';
import { ErrorState, LoadingState } from '../../components/StateView';
import { adminService } from '../../services/adminService';
import type { AuditEvent } from '../../types/domain';

export function AuditLogPage() {
  const auditQuery = useQuery({ queryKey: ['audit-log'], queryFn: adminService.auditLog });
  if (auditQuery.isLoading) return <LoadingState label="Loading audit log" />;
  if (auditQuery.isError) return <ErrorState message="Unable to load audit log" onRetry={() => auditQuery.refetch()} />;

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h2">Audit Log</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Full traceability of document actions, data corrections and system changes.
      </Typography>
      <AppDataTable<AuditEvent>
        rows={auditQuery.data ?? []}
        emptyLabel="No audit events found"
        columns={[
          { key: 'createdAt', header: 'Date', render: (row) => new Date(row.createdAt).toLocaleString() },
          { key: 'actor', header: 'Actor', render: (row) => row.actor },
          { key: 'action', header: 'Action', render: (row) => row.action },
          { key: 'target', header: 'Target', render: (row) => row.target },
        ]}
      />
    </Box>
  );
}
