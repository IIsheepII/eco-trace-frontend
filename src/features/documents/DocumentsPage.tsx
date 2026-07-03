import { Add, Search } from '@mui/icons-material';
import { Box, Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AppDataTable } from '../../components/AppDataTable';
import { EmptyState, ErrorState, LoadingState } from '../../components/StateView';
import { StatusChip } from '../../components/StatusChip';
import { useAuth } from '../auth/AuthProvider';
import { documentService, type DocumentFilters } from '../../services/documentService';
import type { BackendDocumentStatus, DocumentRecord } from '../../types/domain';

export function DocumentsPage() {
  const [filters, setFilters] = useState<DocumentFilters>({});
  const [statusFilter, setStatusFilter] = useState<BackendDocumentStatus | ''>('');
  const { user } = useAuth();
  const canUpload = Boolean(user?.permissions.includes('documents:manage'));
  const documentsQuery = useQuery({ queryKey: ['documents', filters], queryFn: () => documentService.list(filters) });
  const rows = (documentsQuery.data ?? []).filter((document) => !statusFilter || document.status === statusFilter);

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h2">Documents</Typography>
          <Typography color="text.secondary">Search, filter and validate extracted document intelligence.</Typography>
        </Box>
        {canUpload && (
          <Button component={RouterLink} to="/documents/upload" variant="contained" startIcon={<Add />}>
            New Document
          </Button>
        )}
      </Stack>
      <Stack direction={{ xs: 'column', md: 'row' }} gap={2} sx={{ mb: 3 }}>
        <TextField
          label="Search documents"
          InputProps={{ startAdornment: <Search fontSize="small" /> }}
          onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
        />
        <TextField select label="Status" defaultValue="" sx={{ minWidth: 220 }} onChange={(event) => setStatusFilter(event.target.value as BackendDocumentStatus | '')}>
          <MenuItem value="">All statuses</MenuItem>
          <MenuItem value="OCR_PENDING">OCR pending</MenuItem>
          <MenuItem value="EXTRACTION_PENDING">Extraction pending</MenuItem>
          <MenuItem value="VALIDATION_PENDING">Needs validation</MenuItem>
          <MenuItem value="VALIDATED">Validated</MenuItem>
          <MenuItem value="REJECTED">Rejected</MenuItem>
        </TextField>
      </Stack>
      {documentsQuery.isLoading && <LoadingState label="Loading documents" />}
      {documentsQuery.isError && <ErrorState message="Unable to load documents" onRetry={() => documentsQuery.refetch()} />}
      {!documentsQuery.isLoading && rows.length === 0 && (
        <EmptyState
          title="No documents yet"
          body="Upload manifests or images to start the AI extraction pipeline."
          action={
            canUpload ? (
              <Button component={RouterLink} to="/documents/upload" variant="contained">
                Upload document
              </Button>
            ) : undefined
          }
        />
      )}
      {rows.length > 0 && (
        <AppDataTable<DocumentRecord>
          rows={rows}
          emptyLabel="No documents match these filters"
          columns={[
            { key: 'name', header: 'Document', render: (row) => <Button component={RouterLink} to={`/documents/${row.id}`}>{row.name}</Button> },
            { key: 'type', header: 'Type', render: (row) => row.type },
            { key: 'organisation', header: 'Organisation', render: (row) => row.organisation },
            { key: 'confidence', header: 'AI Confidence', render: (row) => `${row.confidence ?? 0}%` },
            { key: 'status', header: 'Status', render: (row) => <StatusChip status={row.status} /> },
            { key: 'uploadedAt', header: 'Uploaded', render: (row) => new Date(row.uploadedAt).toLocaleDateString() },
          ]}
        />
      )}
    </Box>
  );
}
