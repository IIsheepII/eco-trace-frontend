import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Button, Grid, Stack, Step, StepLabel, Stepper, TextField, Typography } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useFieldArray, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { StatusChip } from '../../components/StatusChip';
import { fieldValidationSchema, type FieldValidationFormValues } from '../../schemas/documents';
import { documentService } from '../../services/documentService';
import { EmptyState, ErrorState, LoadingState } from '../../components/StateView';
import { DocumentPreview } from './DocumentPreview';

const manifestSections = [
  {
    title: 'Manifiesto',
    keys: ['manifest_year', 'manifest_month'],
  },
  {
    title: 'Datos Generales del Generador',
    keys: ['generator_razon_social', 'generator_ruc', 'plant_denominacion'],
  },
  {
    title: 'Datos del residuo peligroso manejado',
    keys: ['waste_total_kg', 'basel_a4'],
  },
  {
    title: 'Manejo del residuo peligroso',
    keys: [
      'transporter_razon_social',
      'transporter_ruc',
      'transporter_registro_eo_rs',
      'transporter_responsable_tecnico',
      'transporter_colegiatura',
      'driver_name',
      'vehicle_plate',
      'waste_reception_date',
      'received_quantity_t',
    ],
  },
  {
    title: 'EO-RS del destino final',
    keys: [
      'destination_razon_social_siglas',
      'destination_ruc',
      'destination_codigo_registro_eo_rs',
      'destination_address',
      'destination_responsable_tecnico',
      'destination_refrendo_responsable',
      'destination_refrendo_dni_ce',
      'destination_refrendo_date',
    ],
  },
];

type RenderSection = {
  title: string;
  indexes: number[];
};

export function ValidateDocumentPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const documentQuery = useQuery({ queryKey: ['documents', id], queryFn: () => documentService.get(id), enabled: Boolean(id) });
  const validationMutation = useMutation({
    mutationFn: (values: FieldValidationFormValues) => documentService.validate(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', id] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
      navigate(`/documents/${id}`);
    },
  });
  const form = useForm<FieldValidationFormValues>({
    resolver: zodResolver(fieldValidationSchema),
    values: {
      fields: (documentQuery.data?.fields ?? []).map((field) => ({
        fieldDefinitionId: field.fieldDefinitionId,
        extractedFieldId: field.extractedFieldId,
        finalValue: field.humanValue ?? field.aiValue ?? '',
      })),
      notes: '',
    },
  });
  const { fields } = useFieldArray({ control: form.control, name: 'fields' });

  if (documentQuery.isLoading) return <LoadingState label="Cargando espacio de validación" />;
  if (documentQuery.isError || !documentQuery.data) return <ErrorState message="No se pudo cargar el espacio de validación" onRetry={() => documentQuery.refetch()} />;

  const doc = documentQuery.data;
  const fieldIndexesByKey = new Map(doc.fields?.map((field, index) => [field.key, index]) ?? []);
  const groupedFields = manifestSections
    .map((section) => ({
      ...section,
      indexes: section.keys.map((key) => fieldIndexesByKey.get(key)).filter((index): index is number => index !== undefined),
    }))
    .filter((section) => section.indexes.length > 0);
  const groupedIndexes = new Set(groupedFields.flatMap((section) => section.indexes));
  const ungroupedIndexes = fields.map((_, index) => index).filter((index) => !groupedIndexes.has(index));
  const sections: RenderSection[] = groupedFields.length > 0 ? groupedFields : [{ title: 'Campos extraídos', indexes: fields.map((_, index) => index) }];
  if (groupedFields.length > 0 && ungroupedIndexes.length > 0) {
    sections.push({ title: 'Otros campos', indexes: ungroupedIndexes });
  }

  const renderField = (index: number) => {
    const field = fields[index];
    const original = doc.fields?.[index];
    return (
      <Box
        key={field.id}
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(180px, 0.8fr) minmax(180px, 1fr) minmax(220px, 1.1fr) auto' },
          gap: 1.5,
          alignItems: 'center',
          py: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="body2" fontWeight={700}>
          {original?.label}
        </Typography>
        <Typography variant="body2" color={original?.aiValue ? 'text.primary' : 'text.secondary'} sx={{ overflowWrap: 'anywhere' }}>
          {original?.aiValue ?? 'Sin valor detectado'}
        </Typography>
        <TextField
          label="Valor validado"
          {...form.register(`fields.${index}.finalValue`)}
          error={Boolean(form.formState.errors.fields?.[index]?.finalValue)}
          helperText={form.formState.errors.fields?.[index]?.finalValue?.message}
          size="small"
          fullWidth
        />
        {original && <StatusChip status={original.status} />}
      </Box>
    );
  };

  return (
    <Box>
      <Stepper activeStep={2} alternativeLabel sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', p: { xs: 2, md: 3 }, overflowX: 'auto' }}>
        {['Subir', 'Extraer', 'Validar', 'Completar'].map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Box component="form" onSubmit={form.handleSubmit((values) => validationMutation.mutate(values))} sx={{ p: { xs: 2, md: 3 } }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <DocumentPreview name={doc.name} fileUrl={doc.fileUrl} documentId={doc.id} />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2} sx={{ mb: 2 }}>
              <Box>
                <Typography variant="h2">Validar manifiesto</Typography>
                <Typography color="text.secondary">Compara los valores de IA con los campos corregidos antes de guardar.</Typography>
              </Box>
              <Button type="submit" variant="contained" disabled={validationMutation.isPending}>
                {validationMutation.isPending ? 'Guardando validación' : 'Guardar datos validados'}
              </Button>
            </Stack>
            {validationMutation.isError && <Alert severity="error" sx={{ mb: 2 }}>No se pudieron guardar los datos validados. Revisa los campos e inténtalo nuevamente.</Alert>}
            <Stack gap={2}>
              {fields.length === 0 && (
                <EmptyState title="No hay campos extraídos" body="Ejecuta OCR y extracción con IA antes de validar este documento." />
              )}
              {sections.map((section) => (
                <Box key={section.title}>
                  <Typography variant="h6" sx={{ mb: 1.25 }}>
                    {section.title}
                  </Typography>
                  <Box sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 1, px: 2 }}>
                    {section.indexes.map(renderField)}
                  </Box>
                </Box>
              ))}
              <TextField label="Notas de validación" {...form.register('notes')} multiline minRows={3} />
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
