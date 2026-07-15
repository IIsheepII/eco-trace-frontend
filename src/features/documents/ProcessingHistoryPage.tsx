import { Box, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { AppDataTable } from '../../components/AppDataTable';
import { ErrorState, LoadingState } from '../../components/StateView';
import { StatusChip } from '../../components/StatusChip';
import { documentService } from '../../services/documentService';
import type { DocumentRecord } from '../../types/domain';

export function ProcessingHistoryPage() {
  const historyQuery = useQuery({ queryKey: ['documents', 'processing-history'], queryFn: documentService.processingHistory });
  if (historyQuery.isLoading) return <LoadingState label="Cargando historial de procesamiento" />;
  if (historyQuery.isError) return <ErrorState message="No se pudo cargar el historial de procesamiento" onRetry={() => historyQuery.refetch()} />;

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h2">Historial de procesamiento</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Ejecuciones de OCR y extracción con IA con sus resultados de procesamiento.
      </Typography>
      <AppDataTable<DocumentRecord>
        rows={historyQuery.data ?? []}
        emptyLabel="Aún no hay historial de procesamiento"
        columns={[
          { key: 'name', header: 'Documento', render: (row) => row.name },
          { key: 'type', header: 'Tipo', render: (row) => row.type },
          { key: 'status', header: 'Estado', render: (row) => <StatusChip status={row.status} /> },
          { key: 'confidence', header: 'Confianza', render: (row) => `${row.confidence ?? 0}%` },
          { key: 'processedAt', header: 'Procesado', render: (row) => (row.processedAt ? new Date(row.processedAt).toLocaleString() : 'Pendiente') },
        ]}
      />
    </Box>
  );
}
