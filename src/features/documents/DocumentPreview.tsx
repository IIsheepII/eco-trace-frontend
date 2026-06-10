import { Box, IconButton, Stack, Typography } from '@mui/material';
import { PictureAsPdf, RotateRight, ZoomIn, ZoomOut } from '@mui/icons-material';

export function DocumentPreview({ name, fileUrl }: { name: string; fileUrl?: string }) {
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 480 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Stack direction="row" gap={1} alignItems="center">
          <PictureAsPdf color="primary" />
          <Typography variant="h6">{name}</Typography>
        </Stack>
        <Stack direction="row">
          <IconButton aria-label="Zoom in">
            <ZoomIn />
          </IconButton>
          <IconButton aria-label="Zoom out">
            <ZoomOut />
          </IconButton>
          <IconButton aria-label="Rotate document">
            <RotateRight />
          </IconButton>
        </Stack>
      </Stack>
      <Box sx={{ flex: 1, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'auto', p: 3 }}>
        {fileUrl ? (
          <iframe title={name} src={fileUrl} style={{ width: '100%', height: '100%', minHeight: 620, border: 0 }} />
        ) : (
          <Box sx={{ minHeight: 360, display: 'grid', placeItems: 'center', textAlign: 'center', color: 'text.secondary' }}>
            <Box>
              <PictureAsPdf color="disabled" sx={{ fontSize: 56, mb: 1 }} />
              <Typography variant="h6">Preview unavailable</Typography>
              <Typography variant="body2">The original file is not attached to this document.</Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
