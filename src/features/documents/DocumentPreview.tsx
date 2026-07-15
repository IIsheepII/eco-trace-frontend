import { useEffect, useState } from 'react';
import { Box, CircularProgress, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { PictureAsPdf, RotateRight, ZoomIn, ZoomOut } from '@mui/icons-material';
import { documentService } from '../../services/documentService';

export function DocumentPreview({ name, fileUrl, documentId }: { name: string; fileUrl?: string; documentId?: string }) {
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [previewError, setPreviewError] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  useEffect(() => {
    if (!documentId || !fileUrl) {
      setPreviewUrl(undefined);
      setPreviewError(false);
      return;
    }

    let objectUrl: string | undefined;
    let cancelled = false;
    setIsPreviewLoading(true);
    setPreviewError(false);
    documentService
      .getFileBlob(documentId)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setPreviewError(true);
      })
      .finally(() => {
        if (!cancelled) setIsPreviewLoading(false);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [documentId, fileUrl]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: { xs: 420, md: 520 } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={1.5} sx={{ mb: 2 }}>
        <Stack direction="row" gap={1} alignItems="center" sx={{ minWidth: 0 }}>
          <PictureAsPdf color="primary" />
          <Typography variant="h6" sx={{ overflowWrap: 'anywhere' }}>{name}</Typography>
        </Stack>
        <Stack direction="row">
          <Tooltip title="Los controles del navegador gestionan el zoom del PDF">
            <span>
              <IconButton aria-label="Acercar" disabled>
                <ZoomIn />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Los controles del navegador gestionan el zoom del PDF">
            <span>
              <IconButton aria-label="Alejar" disabled>
                <ZoomOut />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="La rotación no está disponible para esta vista previa">
            <span>
              <IconButton aria-label="Rotar documento" disabled>
                <RotateRight />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>
      <Box sx={{ flex: 1, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'auto', p: { xs: 1.5, md: 3 } }}>
        {previewUrl ? (
          <iframe title={name} src={previewUrl} style={{ width: '100%', height: '100%', minHeight: 620, border: 0 }} />
        ) : isPreviewLoading ? (
          <Box sx={{ minHeight: 360, display: 'grid', placeItems: 'center', textAlign: 'center', color: 'text.secondary' }}>
            <Box>
              <CircularProgress size={32} aria-label="Cargando vista previa" />
              <Typography variant="h6" sx={{ mt: 2 }}>Cargando vista previa</Typography>
            </Box>
          </Box>
        ) : (
          <Box sx={{ minHeight: 360, display: 'grid', placeItems: 'center', textAlign: 'center', color: 'text.secondary' }}>
            <Box>
              <PictureAsPdf color="disabled" sx={{ fontSize: 56, mb: 1 }} />
              <Typography variant="h6">Vista previa no disponible</Typography>
              <Typography variant="body2">
                {previewError ? 'No se pudo cargar la vista previa autenticada del archivo.' : 'El archivo original no está adjunto a este documento.'}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
