import { zodResolver } from '@hookform/resolvers/zod';
import { CloudUpload } from '@mui/icons-material';
import { Alert, Box, Button, Card, CardContent, MenuItem, Stack, Step, StepLabel, Stepper, TextField, Typography } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { uploadDocumentSchema, type UploadDocumentFormValues } from '../../schemas/documents';
import { adminService } from '../../services/adminService';
import { documentService } from '../../services/documentService';
import { ErrorState, LoadingState } from '../../components/StateView';

export function UploadDocumentPage() {
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
  const files = watch('file');

  const onSubmit = handleSubmit(async (values) => {
    const formData = new FormData();
    formData.set('title', values.title);
    formData.set('documentTypeId', values.documentTypeId);
    formData.set('file', values.file[0]);
    const uploaded = await uploadMutation.mutateAsync(formData);
    await documentService.runOcr(uploaded.id);
    await documentService.runAiExtraction(uploaded.id);
    const processed = await documentService.get(uploaded.id);
    queryClient.setQueryData(['documents', uploaded.id], processed);
    queryClient.invalidateQueries({ queryKey: ['documents'] });
    navigate(`/documents/${uploaded.id}/processing`);
  });

  if (documentTypesQuery.isLoading) return <LoadingState label="Loading document types" />;
  if (documentTypesQuery.isError) return <ErrorState message="Unable to load document types" onRetry={() => documentTypesQuery.refetch()} />;

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Stepper activeStep={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', p: 3, mb: 4 }}>
        {['Upload', 'Extract', 'Validate', 'Complete'].map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Typography variant="h2">Upload Document</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Add PDFs or images with organisation context before AI extraction starts.
      </Typography>
      <Box component="form" onSubmit={onSubmit}>
        <Stack gap={3} sx={{ maxWidth: 760 }}>
          {uploadMutation.isError && <Alert severity="error">Upload failed. Check the file type and try again.</Alert>}
          <TextField label="Title" {...register('title')} error={Boolean(errors.title)} helperText={errors.title?.message} />
          <TextField select label="Document type" defaultValue="" {...register('documentTypeId')} error={Boolean(errors.documentTypeId)} helperText={errors.documentTypeId?.message}>
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
              <Typography variant="h3">Drop files here or browse</Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                PDF, JPG, PNG, TIFF and WEBP files are supported.
              </Typography>
              <Button variant="outlined" component="label">
                Choose files
                <input hidden type="file" accept="application/pdf,image/png,image/jpeg,image/tiff,image/webp" {...register('file')} />
              </Button>
              <Typography color={errors.file ? 'error' : 'text.secondary'} sx={{ mt: 2 }}>
                {errors.file?.message ?? (files?.length ? files[0].name : 'No file selected')}
              </Typography>
            </CardContent>
          </Card>
          <Button type="submit" variant="contained" size="large" disabled={uploadMutation.isPending}>
            Start AI extraction
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
