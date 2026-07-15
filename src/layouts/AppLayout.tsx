import {
  Add,
  Analytics,
  Article,
  CorporateFare,
  Dashboard,
  Description,
  Group,
  History,
  Menu,
  Notifications,
  Search,
  Settings,
  Tune,
} from '@mui/icons-material';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  InputBase,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useState } from 'react';
import type { ReactElement } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import logo from '../assets/avka-logo.png';
import { useAuth } from '../features/auth/AuthProvider';
import { stitchColors } from '../theme/theme';

const drawerWidth = 280;

const navItems: { label: string; path: string; icon: ReactElement; permissions?: string[] }[] = [
  { label: 'Panel', path: '/', icon: <Dashboard /> },
  { label: 'Documentos', path: '/documents', icon: <Description /> },
  { label: 'Subir documento', path: '/documents/upload', icon: <Article />, permissions: ['documents:manage'] },
  { label: 'Reportes', path: '/reports', icon: <Analytics />, permissions: ['reports:read'] },
  { label: 'Historial de procesamiento', path: '/processing-history', icon: <History />, permissions: ['documents:manage'] },
  { label: 'Organizaciones', path: '/organisations', icon: <CorporateFare />, permissions: ['organisations:manage'] },
  { label: 'Usuarios y roles', path: '/users', icon: <Group />, permissions: ['users:manage'] },
  { label: 'Tipos de documento', path: '/document-types', icon: <Tune />, permissions: ['documents:manage'] },
  { label: 'Auditoría', path: '/audit-log', icon: <History />, permissions: ['settings:manage'] },
  { label: 'Configuración', path: '/settings', icon: <Settings />, permissions: ['settings:manage'] },
];

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const visibleItems = navItems.filter((item) => user && (!item.permissions?.length || item.permissions.every((permission) => user.permissions.includes(permission))));

  return (
    <Box sx={{ height: '100%', bgcolor: stitchColors.inverseSurface, color: stitchColors.inverseOnSurface, p: 2, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4, px: 1 }}>
        <Avatar src={logo} variant="rounded" sx={{ bgcolor: 'primary.main', width: 40, height: 40 }} />
        <Box>
          <Typography variant="h6">AVKA Intelligence</Typography>
          <Typography variant="caption" sx={{ color: stitchColors.surfaceHighest }}>
            Plataforma empresarial
          </Typography>
        </Box>
      </Box>
      <Button
        startIcon={<Add />}
        variant="contained"
        onClick={() => {
          navigate('/documents/upload');
          onNavigate?.();
        }}
        sx={{ mb: 3, py: 1.25, borderRadius: 3 }}
      >
        Nuevo documento
      </Button>
      <List sx={{ flex: 1 }}>
        {visibleItems.map((item) => (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            end={item.path === '/'}
            onClick={onNavigate}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              color: stitchColors.surfaceHighest,
              '&.active': { bgcolor: stitchColors.primaryContainer, color: '#d5f9ff' },
              '&:hover': { bgcolor: 'rgba(211, 228, 254, 0.1)' },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} primaryTypographyProps={{ variant: 'caption' }} />
          </ListItemButton>
        ))}
      </List>
      <Divider sx={{ borderColor: 'rgba(211, 228, 254, 0.2)', mb: 1 }} />
      <Typography variant="caption" sx={{ color: stitchColors.surfaceHighest, px: 1 }}>
        {user?.name} • {user?.role}
      </Typography>
    </Box>
  );
}

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width:900px)');

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          left: { md: drawerWidth },
          width: { md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar sx={{ gap: 2 }}>
          {!isDesktop && (
            <IconButton aria-label="Abrir navegación" onClick={() => setMobileOpen(true)}>
              <Menu />
            </IconButton>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: stitchColors.surfaceLow, borderRadius: 999, px: 2, maxWidth: 480, flex: 1 }}>
            <Search fontSize="small" color="action" />
            <InputBase fullWidth placeholder="Buscar documentos, entidades o lotes..." sx={{ ml: 1 }} inputProps={{ 'aria-label': 'Búsqueda global' }} />
          </Box>
          <IconButton aria-label="Notificaciones">
            <Notifications />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth, border: 0 } }} open>
        <Sidebar />
      </Drawer>
      <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} sx={{ '& .MuiDrawer-paper': { width: drawerWidth } }}>
        <Sidebar onNavigate={() => setMobileOpen(false)} />
      </Drawer>
      <Box component="main" sx={{ ml: { md: `${drawerWidth}px` }, pt: 8, minHeight: '100vh' }}>
        <Outlet />
      </Box>
    </Box>
  );
}
