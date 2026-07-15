import { Alert, Box, Button, Card, CardContent, Divider, LinearProgress, Stack, Step, StepLabel, Stepper, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { ErrorState, LoadingState } from '../../components/StateView';
import { StatusChip } from '../../components/StatusChip';
import { documentService } from '../../services/documentService';
import type { BackendDocumentStatus } from '../../types/domain';

const IN_PROGRESS_STATUSES: BackendDocumentStatus[] = ['OCR_PENDING', 'OCR_COMPLETED', 'EXTRACTION_PENDING', 'EXTRACTION_COMPLETED'];
const DOCUMENT_STATUSES: BackendDocumentStatus[] = [
  'UPLOADED',
  'OCR_PENDING',
  'OCR_COMPLETED',
  'OCR_FAILED',
  'EXTRACTION_PENDING',
  'EXTRACTION_COMPLETED',
  'VALIDATION_PENDING',
  'VALIDATED',
  'REJECTED',
];

function asBackendDocumentStatus(status?: string): BackendDocumentStatus | undefined {
  return DOCUMENT_STATUSES.includes(status as BackendDocumentStatus) ? (status as BackendDocumentStatus) : undefined;
}

function processingCopy(status?: BackendDocumentStatus) {
  switch (status) {
    case 'OCR_PENDING':
      return 'El OCR está leyendo el archivo original y preparando el texto para la extracción.';
    case 'OCR_COMPLETED':
    case 'EXTRACTION_PENDING':
      return 'El OCR finalizó. La extracción con IA está preparando los campos del documento.';
    case 'OCR_FAILED':
      return 'El OCR falló. Revisa el archivo original o la configuración de OCR antes de reintentar.';
    case 'VALIDATION_PENDING':
      return 'La extracción finalizó. Los campos están listos para validación humana.';
    case 'VALIDATED':
      return 'El documento fue validado.';
    default:
      return 'El documento está siendo analizado para obtener texto OCR, entidades y puntaje de confianza.';
  }
}

export function ProcessingStatusPage() {
  const { id = '' } = useParams();
  const documentQuery = useQuery({
    queryKey: ['documents', id],
    queryFn: () => documentService.get(id),
    enabled: Boolean(id),
    refetchInterval: (query) => (IN_PROGRESS_STATUSES.includes(query.state.data?.status as BackendDocumentStatus) ? 3000 : false),
  });
  const statusQuery = useQuery({
    queryKey: ['documents', id, 'processing-status'],
    queryFn: () => documentService.getProcessingStatus(id),
    enabled: Boolean(id),
    refetchInterval: (query) => (IN_PROGRESS_STATUSES.includes(query.state.data?.documentStatus as BackendDocumentStatus) ? 3000 : false),
  });
  const ocrResultQuery = useQuery({
    queryKey: ['documents', id, 'ocr-result'],
    queryFn: () => documentService.getOcrResult(id),
    enabled: Boolean(statusQuery.data?.ocrResult?.id),
    retry: false,
  });

  if (documentQuery.isLoading || statusQuery.isLoading) return <LoadingState label="Cargando estado de procesamiento" />;
  if (documentQuery.isError || statusQuery.isError) {
    return (
      <ErrorState
        message="No se pudo cargar el estado de procesamiento"
        onRetry={() => {
          documentQuery.refetch();
          statusQuery.refetch();
        }}
      />
    );
  }

  const doc = documentQuery.data;
  const processingStatus = statusQuery.data;
  const currentStatus = processingStatus?.documentStatus ?? asBackendDocumentStatus(doc?.status);
  const latestJob = processingStatus?.latestJob ?? processingStatus?.processingJob ?? null;
  const activeStep = currentStatus === 'VALIDATED' ? 3 : currentStatus === 'VALIDATION_PENDING' ? 2 : 1;
  const isProcessing = currentStatus ? IN_PROGRESS_STATUSES.includes(currentStatus) : false;
  const canValidate = currentStatus === 'VALIDATION_PENDING';
  const hasFailed = currentStatus === 'OCR_FAILED' || latestJob?.status === 'FAILED';
  const ocrText = ocrResultQuery.data?.rawText.trim();

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', p: { xs: 2, md: 3 }, mb: 4, overflowX: 'auto' }}>
        {['Subir', 'Extraer', 'Validar', 'Completar'].map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Card sx={{ maxWidth: 760 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2} sx={{ mb: 1 }}>
            <Typography variant="h2">{canValidate ? 'Extracción completada' : hasFailed ? 'La extracción requiere atención' : 'Extracción con IA en progreso'}</Typography>
            {currentStatus && <StatusChip status={currentStatus} />}
          </Stack>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {doc?.name} {processingCopy(currentStatus)}
          </Typography>
          {hasFailed && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {latestJob?.errorMessage ?? processingStatus?.ocrResult?.errorMessage ?? 'El procesamiento falló.'}
            </Alert>
          )}
          <LinearProgress variant={isProcessing ? 'indeterminate' : 'determinate'} value={100} sx={{ mb: 3, borderRadius: 999 }} />
          <Stack gap={1.5} sx={{ mb: 3 }}>
            {latestJob && (
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
                <Typography color="text.secondary">Último trabajo</Typography>
                <Stack direction="row" gap={1} alignItems="center">
                  <Typography>{latestJob.type}</Typography>
                  <StatusChip status={latestJob.status} />
                </Stack>
              </Stack>
            )}
            {processingStatus?.ocrJob && (
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
                <Typography color="text.secondary">Trabajo OCR</Typography>
                <StatusChip status={processingStatus.ocrJob.status} />
              </Stack>
            )}
            {processingStatus?.aiExtractionJob && (
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
                <Typography color="text.secondary">Trabajo de extracción IA</Typography>
                <StatusChip status={processingStatus.aiExtractionJob.status} />
              </Stack>
            )}
            {processingStatus?.ocrResult && (
              <>
                <Divider />
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
                  <Typography color="text.secondary">Idioma OCR</Typography>
                  <Typography>{processingStatus.ocrResult.language}</Typography>
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
                  <Typography color="text.secondary">Caracteres OCR</Typography>
                  <Typography>{processingStatus.ocrResult.characterCount}</Typography>
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
                  <Typography color="text.secondary">Tiempo OCR</Typography>
                  <Typography>{processingStatus.ocrResult.processingTimeMs} ms</Typography>
                </Stack>
              </>
            )}
          </Stack>
          {ocrText && (
            <Box sx={{ bgcolor: 'background.default', border: 1, borderColor: 'divider', borderRadius: 1, p: 2, mb: 3, maxHeight: 220, overflow: 'auto' }}>
              <Typography variant="caption" color="text.secondary">
                Texto OCR
              </Typography>
              <Typography component="pre" sx={{ m: 0, mt: 1, whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: 13 }}>
                {ocrText}
              </Typography>
            </Box>
          )}
          <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
            <Button component={RouterLink} to={`/documents/${id}`} variant="outlined">
              Ver detalle
            </Button>
            {canValidate ? (
              <Button component={RouterLink} to={`/documents/${id}/validate`} variant="contained">
                Validar campos
              </Button>
            ) : (
              <Button variant="contained" disabled>
                Validar campos
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
