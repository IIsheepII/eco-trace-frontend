import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';
import type { ReactNode } from 'react';

export function LoadingState({ label = 'Loading workspace' }: { label?: string }) {
  return (
    <Box sx={{ minHeight: 240, display: 'grid', placeItems: 'center', gap: 2 }}>
      <CircularProgress aria-label={label} />
      <Typography color="text.secondary">{label}</Typography>
    </Box>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Alert
      severity="error"
      action={
        onRetry ? (
          <Button color="inherit" size="small" onClick={onRetry}>
            Retry
          </Button>
        ) : undefined
      }
    >
      {message}
    </Alert>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <Box
      sx={{
        minHeight: 300,
        display: 'grid',
        placeItems: 'center',
        textAlign: 'center',
        border: '1px dashed',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.paper',
        p: 4,
      }}
    >
      <Box>
        <Typography variant="h3" gutterBottom>
          {title}
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 440, mb: action ? 3 : 0 }}>
          {body}
        </Typography>
        {action}
      </Box>
    </Box>
  );
}
