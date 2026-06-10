import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Card, CardContent, Grid, LinearProgress, Stack, Step, StepLabel, Stepper, TextField, Typography } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useFieldArray, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { StatusChip } from '../../components/StatusChip';
import { fieldValidationSchema, type FieldValidationFormValues } from '../../schemas/documents';
import { documentService } from '../../services/documentService';
import { ErrorState, LoadingState } from '../../components/StateView';
import { DocumentPreview } from './DocumentPreview';

export function ValidateDocumentPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const documentQuery = useQuery({ queryKey: ['documents', id], queryFn: () => documentService.get(id), enabled: Boolean(id) });
  const validationMutation = useMutation({
    mutationFn: (values: FieldValidationFormValues) => documentService.validate(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', id] });
      navigate(`/documents/${id}`);
    },
  });
  const form = useForm<FieldValidationFormValues>({
    resolver: zodResolver(fieldValidationSchema),
    values: {
      fields: (documentQuery.data?.fields ?? []).map((field) => ({
        fieldDefinitionId: field.fieldDefinitionId,
        extractedFieldId: field.id,
        finalValue: field.humanValue ?? field.aiValue ?? '',
      })),
      notes: '',
    },
  });
  const { fields } = useFieldArray({ control: form.control, name: 'fields' });

  if (documentQuery.isLoading) return <LoadingState label="Loading validation workspace" />;
  if (documentQuery.isError || !documentQuery.data) return <ErrorState message="Unable to load validation workspace" onRetry={() => documentQuery.refetch()} />;

  const doc = documentQuery.data;

  return (
    <Box>
      <Stepper activeStep={2} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', p: 3 }}>
        {['Upload', 'Extract', 'Validate', 'Complete'].map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Box component="form" onSubmit={form.handleSubmit((values) => validationMutation.mutate(values))} sx={{ p: { xs: 2, md: 3 } }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <DocumentPreview name={doc.name} fileUrl={doc.fileUrl} />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2} sx={{ mb: 2 }}>
              <Box>
                <Typography variant="h2">Validate Manifest</Typography>
                <Typography color="text.secondary">Compare AI values with human-corrected fields before saving.</Typography>
              </Box>
              <Button type="submit" variant="contained" disabled={validationMutation.isPending}>
                Save validated data
              </Button>
            </Stack>
            <Stack gap={2}>
              {fields.map((field, index) => {
                const original = doc.fields?.[index];
                return (
                  <Card key={field.id}>
                    <CardContent>
                      <Stack gap={1.5}>
                      <Stack direction="row" justifyContent="space-between" gap={2}>
                        <Box>
                            <Typography variant="caption" color="text.secondary">
                              {original?.label}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            AI extracted: {original?.aiValue}
                          </Typography>
                        </Box>
                          {original && <StatusChip status={original.status} />}
                        </Stack>
                        <LinearProgress variant="determinate" value={original?.confidence ?? 0} sx={{ borderRadius: 999 }} />
                        <TextField label="Validated value" {...form.register(`fields.${index}.finalValue`)} fullWidth />
                      </Stack>
                    </CardContent>
                  </Card>
                );
              })}
              <TextField label="Validation notes" {...form.register('notes')} multiline minRows={3} />
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
