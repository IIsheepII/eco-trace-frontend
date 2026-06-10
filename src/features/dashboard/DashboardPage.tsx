import { Article, FactCheck, PendingActions, Speed } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Grid, LinearProgress, Stack, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { ReactElement } from 'react';
import { AppDataTable } from '../../components/AppDataTable';
import { ErrorState, LoadingState } from '../../components/StateView';
import { StatusChip } from '../../components/StatusChip';
import { useAuth } from '../auth/AuthProvider';
import { dashboardService } from '../../services/dashboardService';
import type { DocumentRecord } from '../../types/domain';

function MetricCard({ label, value, icon }: { label: string; value?: string | number; icon: ReactElement }) {
  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box sx={{ p: 1.5, bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: 2 }}>{icon}</Box>
          <Typography variant="caption" color="secondary">
            LIVE
          </Typography>
        </Stack>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 3 }}>
          {label}
        </Typography>
        <Typography variant="h3">{value ?? '...'}</Typography>
        <LinearProgress variant="determinate" value={76} sx={{ mt: 2, borderRadius: 999 }} />
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canReadMetrics = Boolean(user?.permissions.includes('reports:read'));
  const metricsQuery = useQuery({ queryKey: ['dashboard', 'metrics', canReadMetrics], queryFn: () => dashboardService.metrics(canReadMetrics) });
  const activityQuery = useQuery({ queryKey: ['dashboard', 'activity'], queryFn: dashboardService.activity });

  if (metricsQuery.isLoading) return <LoadingState />;
  if (metricsQuery.isError) return <ErrorState message="Unable to load dashboard metrics" onRetry={() => metricsQuery.refetch()} />;

  const metrics = metricsQuery.data;

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'flex-end' }} gap={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h2">System Overview</Typography>
          <Typography color="text.secondary">Intelligent document processing across active organisations.</Typography>
        </Box>
        <Button variant="contained" onClick={() => navigate('/documents/upload')}>
          Upload Document
        </Button>
      </Stack>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 3 }}>
          <MetricCard label="Total Documents" value={metrics?.totalDocuments.toLocaleString()} icon={<Article />} />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <MetricCard label="Pending Validation" value={metrics?.pendingValidation} icon={<PendingActions />} />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <MetricCard label="Accuracy Rate" value={`${metrics?.accuracyRate ?? 0}%`} icon={<FactCheck />} />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <MetricCard label="Processing Queue" value={metrics?.processingQueue} icon={<Speed />} />
        </Grid>
      </Grid>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h3" sx={{ mb: 2 }}>
          Live Activity Queue
        </Typography>
        {activityQuery.isLoading ? (
          <LoadingState label="Loading activity" />
        ) : (
          <AppDataTable<DocumentRecord>
            rows={activityQuery.data ?? []}
            emptyLabel="No active documents in the queue"
            columns={[
              { key: 'name', header: 'Document', render: (row) => row.name },
              { key: 'type', header: 'Type', render: (row) => row.type },
              { key: 'organisation', header: 'Organisation', render: (row) => row.organisation },
              { key: 'status', header: 'Status', render: (row) => <StatusChip status={row.status} /> },
              { key: 'uploadedAt', header: 'Uploaded', render: (row) => new Date(row.uploadedAt).toLocaleString() },
            ]}
          />
        )}
      </Box>
    </Box>
  );
}
