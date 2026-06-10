import { Block } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export function AccessDeniedPage() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 3 }}>
      <Card sx={{ maxWidth: 520 }}>
        <CardContent sx={{ textAlign: 'center', p: 5 }}>
          <Block color="error" sx={{ fontSize: 56 }} />
          <Typography variant="h2">Access denied</Typography>
          <Typography color="text.secondary" sx={{ my: 2 }}>
            Your role does not include permission to view this workspace.
          </Typography>
          <Button component={RouterLink} to="/" variant="contained">
            Return to dashboard
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
