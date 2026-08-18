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
  const [draftFilters, setDraftFilters] = useState<DocumentFilters>({});
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
          <Typography variant="h2">Documentos</Typography>
          <Typography color="text.secondary">Busca, filtra y valida la información extraída de los documentos.</Typography>
        </Box>
        {canUpload && (
          <Button component={RouterLink} to="/documents/upload" variant="contained" startIcon={<Add />}>
            Nuevo documento
          </Button>
        )}
      </Stack>
      <Stack direction={{ xs: 'column', md: 'row' }} gap={2} sx={{ mb: 3 }}>
        <TextField
          label="Buscar documentos"
          InputProps={{ startAdornment: <Search fontSize="small" /> }}
          value={draftFilters.q ?? ''}
          onChange={(event) => setDraftFilters((current) => ({ ...current, q: event.target.value }))}
        />
        <TextField select label="Estado" defaultValue="" sx={{ minWidth: 220 }} onChange={(event) => setStatusFilter(event.target.value as BackendDocumentStatus | '')}>
          <MenuItem value="">Todos los estados</MenuItem>
          <MenuItem value="OCR_PENDING">OCR pendiente</MenuItem>
          <MenuItem value="EXTRACTION_PENDING">Extracción pendiente</MenuItem>
          <MenuItem value="VALIDATION_PENDING">Requiere validación</MenuItem>
          <MenuItem value="VALIDATED">Validado</MenuItem>
          <MenuItem value="REJECTED">Rechazado</MenuItem>
        </TextField>
        <Button
          variant="contained"
          startIcon={<Search />}
          onClick={() => setFilters({ ...draftFilters, trackEvaluation: 'true', evaluationStartedAt: new Date().toISOString() })}
        >
          Buscar
        </Button>
      </Stack>
      {documentsQuery.isLoading && <LoadingState label="Cargando documentos" />}
      {documentsQuery.isError && <ErrorState message="No se pudieron cargar los documentos" onRetry={() => documentsQuery.refetch()} />}
      {!documentsQuery.isLoading && rows.length === 0 && (
        <EmptyState
          title="Aún no hay documentos"
          body="Sube manifiestos o imágenes para iniciar el flujo de extracción con IA."
          action={
            canUpload ? (
              <Button component={RouterLink} to="/documents/upload" variant="contained">
                Subir documento
              </Button>
            ) : undefined
          }
        />
      )}
      {rows.length > 0 && (
        <AppDataTable<DocumentRecord>
          rows={rows}
          emptyLabel="Ningún documento coincide con estos filtros"
          columns={[
            { key: 'name', header: 'Documento', render: (row) => <Button component={RouterLink} to={`/documents/${row.id}`}>{row.name}</Button> },
            { key: 'type', header: 'Tipo', render: (row) => row.type },
            { key: 'organisation', header: 'Organización', render: (row) => row.organisation },
            { key: 'confidence', header: 'Confianza IA', render: (row) => `${row.confidence ?? 0}%` },
            { key: 'status', header: 'Estado', render: (row) => <StatusChip status={row.status} /> },
            { key: 'uploadedAt', header: 'Subido', render: (row) => new Date(row.uploadedAt).toLocaleDateString() },
          ]}
        />
      )}
    </Box>
  );
}
