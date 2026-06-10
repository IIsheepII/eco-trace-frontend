import { Box, Button, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { ErrorState, LoadingState } from '../../components/StateView';
import { StatusChip } from '../../components/StatusChip';
import { documentService } from '../../services/documentService';
import { DocumentPreview } from './DocumentPreview';

export function DocumentDetailPage() {
  const { id = '' } = useParams();
  const documentQuery = useQuery({ queryKey: ['documents', id], queryFn: () => documentService.get(id), enabled: Boolean(id) });

  if (documentQuery.isLoading) return <LoadingState label="Loading document detail" />;
  if (documentQuery.isError || !documentQuery.data) return <ErrorState message="Unable to load document detail" onRetry={() => documentQuery.refetch()} />;

  const doc = documentQuery.data;

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h2">{doc.name}</Typography>
          <Stack direction="row" gap={1} alignItems="center">
            <StatusChip status={doc.status} />
            <Typography color="text.secondary">{doc.organisation}</Typography>
          </Stack>
        </Box>
        <Button component={RouterLink} to={`/documents/${doc.id}/validate`} variant="contained">
          Validate extracted fields
        </Button>
      </Stack>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <DocumentPreview name={doc.name} fileUrl={doc.fileUrl} />
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Stack gap={2}>
            {(doc.fields ?? []).map((field) => (
              <Card key={field.id}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" gap={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {field.label}
                      </Typography>
                      <Typography>{field.humanValue || field.aiValue}</Typography>
                      {field.humanValue && field.humanValue !== field.aiValue && (
                        <Typography variant="body2" color="text.secondary">
                          AI value: {field.aiValue}
                        </Typography>
                      )}
                    </Box>
                    <StatusChip status={field.status} />
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
