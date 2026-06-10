import { Box, Button, Card, CardContent, LinearProgress, Stack, Step, StepLabel, Stepper, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { ErrorState, LoadingState } from '../../components/StateView';
import { documentService } from '../../services/documentService';

export function ProcessingStatusPage() {
  const { id = '' } = useParams();
  const documentQuery = useQuery({
    queryKey: ['documents', id],
    queryFn: () => documentService.get(id),
    enabled: Boolean(id),
    refetchInterval: (query) => (['OCR_PENDING', 'EXTRACTION_PENDING'].includes(query.state.data?.status ?? '') ? 3000 : false),
  });

  if (documentQuery.isLoading) return <LoadingState label="Loading processing status" />;
  if (documentQuery.isError) return <ErrorState message="Unable to load processing status" onRetry={() => documentQuery.refetch()} />;

  const doc = documentQuery.data;
  const activeStep = doc?.status === 'VALIDATED' ? 3 : doc?.status === 'VALIDATION_PENDING' ? 2 : 1;

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Stepper activeStep={activeStep} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', p: 3, mb: 4 }}>
        {['Upload', 'Extract', 'Validate', 'Complete'].map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Card sx={{ maxWidth: 760 }}>
        <CardContent>
          <Typography variant="h2">AI Extraction in Progress</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {doc?.name} is being analysed for OCR text, document entities and confidence scoring.
          </Typography>
          <LinearProgress variant={['OCR_PENDING', 'EXTRACTION_PENDING'].includes(doc?.status ?? '') ? 'indeterminate' : 'determinate'} value={100} sx={{ mb: 3, borderRadius: 999 }} />
          <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
            <Button component={RouterLink} to={`/documents/${id}`} variant="outlined">
              View detail
            </Button>
            <Button component={RouterLink} to={`/documents/${id}/validate`} variant="contained" disabled={doc?.status !== 'VALIDATION_PENDING'}>
              Validate fields
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
