import { zodResolver } from '@hookform/resolvers/zod';
import { CloudUpload } from '@mui/icons-material';
import { Alert, Box, Button, Card, CardContent, LinearProgress, MenuItem, Stack, Step, StepLabel, Stepper, TextField, Typography } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadDocumentSchema, type UploadDocumentFormValues } from '../../schemas/documents';
import { adminService } from '../../services/adminService';
import { documentService } from '../../services/documentService';
import { ErrorState, LoadingState } from '../../components/StateView';
import { ApiError } from '../../services/apiClient';

export function UploadDocumentPage() {
  const registrationStartedAt = useRef(new Date().toISOString());
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<UploadDocumentFormValues>({ resolver: zodResolver(uploadDocumentSchema) });
  const documentTypesQuery = useQuery({ queryKey: ['admin', 'document-types'], queryFn: adminService.documentTypes });
  const uploadMutation = useMutation({ mutationFn: documentService.upload });
  const processingMutation = useMutation({
    mutationFn: async (documentId: string) => {
      await documentService.processOcr(documentId);
      await documentService.runAiExtraction(documentId);
      return documentService.get(documentId);
    },
  });
  const files = watch('file');
  const isSubmitting = uploadMutation.isPending || processingMutation.isPending;
  const error = uploadMutation.error ?? processingMutation.error;
  const errorMessage =
    error instanceof ApiError ? error.message : error instanceof Error ? error.message : 'No se pudo procesar el documento.';
  const submitPhase = uploadMutation.isPending ? 'Subiendo documento' : processingMutation.isPending ? 'Ejecutando OCR y extracción con IA' : undefined;

  const onSubmit = handleSubmit(async (values) => {
    const formData = new FormData();
    formData.set('title', values.title);
    formData.set('documentTypeId', values.documentTypeId);
    formData.set('file', values.file[0]);
    formData.set('registrationStartedAt', registrationStartedAt.current);
    const uploaded = await uploadMutation.mutateAsync(formData);
    const processed = await processingMutation.mutateAsync(uploaded.id);
    queryClient.setQueryData(['documents', uploaded.id], processed);
    queryClient.invalidateQueries({ queryKey: ['documents'] });
    queryClient.invalidateQueries({ queryKey: ['metrics'] });
    navigate(`/documents/${uploaded.id}/processing`);
  });

  if (documentTypesQuery.isLoading) return <LoadingState label="Cargando tipos de documento" />;
  if (documentTypesQuery.isError) return <ErrorState message="No se pudieron cargar los tipos de documento" onRetry={() => documentTypesQuery.refetch()} />;

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Stepper activeStep={0} alternativeLabel sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', p: { xs: 2, md: 3 }, mb: 4, overflowX: 'auto' }}>
        {['Subir', 'Extraer', 'Validar', 'Completar'].map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Typography variant="h2">Subir documento</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Agrega PDFs o imágenes con el contexto de la organización antes de iniciar la extracción con IA.
      </Typography>
      <Box component="form" onSubmit={onSubmit}>
        <Stack gap={3} sx={{ maxWidth: 760 }}>
          {(uploadMutation.isError || processingMutation.isError) && <Alert severity="error">{errorMessage}</Alert>}
          {submitPhase && (
            <Alert severity="info" icon={false}>
              <Stack gap={1}>
                <Typography>{submitPhase}</Typography>
                <LinearProgress aria-label={submitPhase} />
              </Stack>
            </Alert>
          )}
          <TextField label="Título" {...register('title')} error={Boolean(errors.title)} helperText={errors.title?.message} />
          <TextField select label="Tipo de documento" defaultValue="" {...register('documentTypeId')} error={Boolean(errors.documentTypeId)} helperText={errors.documentTypeId?.message}>
            {(documentTypesQuery.data ?? []).map((type) => (
              <MenuItem key={type.id} value={type.id}>
                {type.name}
              </MenuItem>
            ))}
          </TextField>
          <Card>
            <CardContent
              sx={{
                minHeight: 220,
                display: 'grid',
                placeItems: 'center',
                textAlign: 'center',
                border: '1px dashed',
                borderColor: errors.file ? 'error.main' : 'divider',
              }}
            >
              <CloudUpload color="primary" sx={{ fontSize: 48 }} />
              <Typography variant="h3">Arrastra archivos aquí o busca en tu equipo</Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Se admiten archivos PDF, JPG, PNG, TIFF y WEBP.
              </Typography>
              <Button variant="outlined" component="label">
                Elegir archivos
                <input hidden type="file" accept="application/pdf,image/png,image/jpeg,image/tiff,image/webp" {...register('file')} />
              </Button>
              <Typography color={errors.file ? 'error' : 'text.secondary'} sx={{ mt: 2 }}>
                {errors.file?.message ?? (files?.length ? files[0].name : 'Ningún archivo seleccionado')}
              </Typography>
            </CardContent>
          </Card>
          <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
            {submitPhase ?? 'Iniciar extracción con IA'}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
