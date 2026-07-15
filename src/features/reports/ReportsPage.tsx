import { zodResolver } from '@hookform/resolvers/zod';
import { Addchart } from '@mui/icons-material';
import { Alert, Box, Button, Card, CardContent, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { AppDataTable } from '../../components/AppDataTable';
import { reportSchema, type ReportFormValues } from '../../schemas/reports';
import { reportService } from '../../services/reportService';
import type { Report } from '../../types/domain';

export function ReportsPage() {
  const queryClient = useQueryClient();
  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: { format: 'PDF' },
  });
  const reportsQuery = useQuery({ queryKey: ['reports'], queryFn: reportService.list });
  const reportMutation = useMutation({
    mutationFn: reportService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      form.reset({ title: '', format: 'PDF', documentId: '' });
    },
  });

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h2">Reportes</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Configura reportes del sistema con parámetros en vivo y formatos de exportación.
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card>
            <CardContent>
              <Stack component="form" gap={2} onSubmit={form.handleSubmit((values) => reportMutation.mutate(values))}>
                {reportMutation.isError && <Alert severity="error">La generación del reporte falló.</Alert>}
                {reportMutation.isSuccess && <Alert severity="success">Reporte generado.</Alert>}
                <TextField label="Título del reporte" {...form.register('title')} error={Boolean(form.formState.errors.title)} helperText={form.formState.errors.title?.message} />
                <TextField label="ID de documento (opcional)" {...form.register('documentId')} />
                <TextField select label="Formato" defaultValue="PDF" {...form.register('format')}>
                  <MenuItem value="PDF">PDF</MenuItem>
                  <MenuItem value="XLSX">XLSX</MenuItem>
                </TextField>
                <Button type="submit" variant="contained" startIcon={<Addchart />} disabled={reportMutation.isPending}>
                  Generar reporte
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardContent>
              <Typography variant="h3">Reportes del sistema</Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Los análisis incluyen volumen de extracción, tiempos de validación, tendencias de confianza y diferencias por corrección.
              </Typography>
              <AppDataTable<Report>
                rows={reportsQuery.data ?? []}
                emptyLabel={reportsQuery.isLoading ? 'Cargando reportes' : 'Aún no hay reportes generados'}
                columns={[
                  { key: 'title', header: 'Título', render: (row) => row.title },
                  { key: 'format', header: 'Formato', render: (row) => row.format },
                  { key: 'durationMs', header: 'Duración', render: (row) => `${row.durationMs ?? 0} ms` },
                  { key: 'createdAt', header: 'Creado', render: (row) => new Date(row.createdAt).toLocaleString() },
                ]}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
