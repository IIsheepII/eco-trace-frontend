import { Box, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { AppDataTable } from '../../components/AppDataTable';
import { EmptyState, ErrorState, LoadingState } from '../../components/StateView';
import { settingsService, type Setting } from '../../services/settingsService';

export function SettingsPage() {
  const settingsQuery = useQuery({ queryKey: ['settings'], queryFn: settingsService.list });

  if (settingsQuery.isLoading) return <LoadingState label="Loading settings" />;
  if (settingsQuery.isError) return <ErrorState message="Unable to load settings" onRetry={() => settingsQuery.refetch()} />;

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h2">Settings</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Account, notification and validation workflow preferences.
      </Typography>
      {(settingsQuery.data ?? []).length === 0 ? (
        <EmptyState title="No settings configured" body="Organisation settings will appear here after they are created through the backend API." />
      ) : (
        <AppDataTable<Setting>
          rows={settingsQuery.data ?? []}
          emptyLabel="No settings configured"
          columns={[
            { key: 'key', header: 'Key', render: (row) => row.key },
            { key: 'value', header: 'Value', render: (row) => JSON.stringify(row.value) },
            { key: 'updatedAt', header: 'Updated', render: (row) => new Date(row.updatedAt).toLocaleString() },
          ]}
        />
      )}
    </Box>
  );
}
