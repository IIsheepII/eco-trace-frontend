import { Box, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { AppDataTable } from '../../components/AppDataTable';
import { ErrorState, LoadingState } from '../../components/StateView';
import { StatusChip } from '../../components/StatusChip';
import { documentService } from '../../services/documentService';
import type { DocumentRecord } from '../../types/domain';

export function ProcessingHistoryPage() {
  const historyQuery = useQuery({ queryKey: ['documents', 'processing-history'], queryFn: documentService.processingHistory });
  if (historyQuery.isLoading) return <LoadingState label="Loading processing history" />;
  if (historyQuery.isError) return <ErrorState message="Unable to load processing history" onRetry={() => historyQuery.refetch()} />;

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h2">Processing History</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        OCR and AI extraction runs with processing outcomes.
      </Typography>
      <AppDataTable<DocumentRecord>
        rows={historyQuery.data ?? []}
        emptyLabel="No processing history yet"
        columns={[
          { key: 'name', header: 'Document', render: (row) => row.name },
          { key: 'type', header: 'Type', render: (row) => row.type },
          { key: 'status', header: 'Status', render: (row) => <StatusChip status={row.status} /> },
          { key: 'confidence', header: 'Confidence', render: (row) => `${row.confidence ?? 0}%` },
          { key: 'processedAt', header: 'Processed', render: (row) => (row.processedAt ? new Date(row.processedAt).toLocaleString() : 'Pending') },
        ]}
      />
    </Box>
  );
}
