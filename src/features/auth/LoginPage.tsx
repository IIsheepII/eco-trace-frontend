import { zodResolver } from '@hookform/resolvers/zod';
import { Dataset, Speed, Verified } from '@mui/icons-material';
import { Alert, Box, Button, Card, CardContent, Link, Stack, TextField, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { loginSchema, type LoginFormValues } from '../../schemas/auth';
import { stitchColors } from '../../theme/theme';
import { useAuth } from './AuthProvider';

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } } | undefined)?.from?.pathname ?? '/';
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login(values);
      navigate(from, { replace: true });
    } catch {
      setError('root', { message: 'Unable to sign in with those credentials' });
    }
  });

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '3fr 2fr' } }}>
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          bgcolor: stitchColors.inverseSurface,
          color: 'white',
          p: { md: 6, lg: 8 },
        }}
      >
        <Stack direction="row" alignItems="center" gap={1.5}>
          <Box sx={{ bgcolor: 'primary.main', p: 1, borderRadius: 2, display: 'grid', placeItems: 'center' }}>
            <Dataset />
          </Box>
          <Typography variant="h3">AVKA Intelligence</Typography>
        </Stack>
        <Box sx={{ maxWidth: 640 }}>
          <Typography variant="h1" sx={{ mb: 3 }}>
            Precision Intelligence for Enterprise Documents.
          </Typography>
          <Typography variant="body1" sx={{ color: stitchColors.surfaceHighest, mb: 6 }}>
            Transform complex manifests into verified institutional data with AI extraction, human validation and audit-ready traceability.
          </Typography>
          <Stack direction={{ sm: 'row' }} gap={3}>
            <Card sx={{ bgcolor: 'rgba(255,255,255,0.06)', color: 'white', borderColor: 'rgba(255,255,255,0.12)', flex: 1 }}>
              <CardContent>
                <Verified color="primary" />
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  ACCURACY RATE
                </Typography>
                <Typography variant="h3">99.98%</Typography>
              </CardContent>
            </Card>
            <Card sx={{ bgcolor: 'rgba(255,255,255,0.06)', color: 'white', borderColor: 'rgba(255,255,255,0.12)', flex: 1 }}>
              <CardContent>
                <Speed color="primary" />
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  PROCESSING SPEED
                </Typography>
                <Typography variant="h3">&lt; 1.2s / page</Typography>
              </CardContent>
            </Card>
          </Stack>
        </Box>
        <Typography variant="caption" sx={{ color: stitchColors.surfaceHighest }}>
          Certified Enterprise Security Layer • SOC2 Type II
        </Typography>
      </Box>
      <Box sx={{ display: 'grid', placeItems: 'center', bgcolor: 'background.paper', p: { xs: 3, sm: 6 } }}>
        <Box component="form" onSubmit={onSubmit} sx={{ width: '100%', maxWidth: 440 }}>
          <Typography variant="h2" gutterBottom>
            Welcome to AVKA
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>
            Sign in with your enterprise account to continue.
          </Typography>
          {errors.root && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.root.message}
            </Alert>
          )}
          <Stack gap={2.5}>
            <TextField label="Work email" autoComplete="email" {...register('email')} error={Boolean(errors.email)} helperText={errors.email?.message} />
            <TextField
              label="Password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
            />
            <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
              Sign in
            </Button>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
            Need access? <Link href="mailto:security@avka.example">Contact your administrator</Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
