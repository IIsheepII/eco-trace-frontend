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
            EN VIVO
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
  if (metricsQuery.isError) return <ErrorState message="No se pudieron cargar las métricas del panel" onRetry={() => metricsQuery.refetch()} />;

  const metrics = metricsQuery.data;

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'flex-end' }} gap={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h2">Resumen del sistema</Typography>
          <Typography color="text.secondary">Procesamiento inteligente de documentos en organizaciones activas.</Typography>
        </Box>
        <Button variant="contained" onClick={() => navigate('/documents/upload')}>
          Subir documento
        </Button>
      </Stack>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 3 }}>
          <MetricCard label="Documentos totales" value={metrics?.totalDocuments.toLocaleString()} icon={<Article />} />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <MetricCard label="Pendientes de validación" value={metrics?.pendingValidation} icon={<PendingActions />} />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <MetricCard label="Tasa de precisión" value={`${metrics?.accuracyRate ?? 0}%`} icon={<FactCheck />} />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <MetricCard label="Cola de procesamiento" value={metrics?.processingQueue} icon={<Speed />} />
        </Grid>
      </Grid>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h3" sx={{ mb: 2 }}>
          Cola de actividad en vivo
        </Typography>
        {activityQuery.isLoading ? (
          <LoadingState label="Cargando actividad" />
        ) : (
          <AppDataTable<DocumentRecord>
            rows={activityQuery.data ?? []}
            emptyLabel="No hay documentos activos en la cola"
            columns={[
              { key: 'name', header: 'Documento', render: (row) => row.name },
              { key: 'type', header: 'Tipo', render: (row) => row.type },
              { key: 'organisation', header: 'Organización', render: (row) => row.organisation },
              { key: 'status', header: 'Estado', render: (row) => <StatusChip status={row.status} /> },
              { key: 'uploadedAt', header: 'Subido', render: (row) => new Date(row.uploadedAt).toLocaleString() },
            ]}
          />
        )}
      </Box>
    </Box>
  );
}
