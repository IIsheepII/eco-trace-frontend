import { createTheme } from '@mui/material/styles';

export const stitchColors = {
  surface: '#f8f9ff',
  surfaceLow: '#eff4ff',
  surfaceContainer: '#e5eeff',
  surfaceHigh: '#dce9ff',
  surfaceHighest: '#d3e4fe',
  white: '#ffffff',
  onSurface: '#0b1c30',
  onSurfaceVariant: '#3e494a',
  inverseSurface: '#213145',
  inverseOnSurface: '#eaf1ff',
  outline: '#6e797b',
  outlineVariant: '#bdc8cb',
  primary: '#005f6a',
  primaryContainer: '#007a87',
  secondary: '#406652',
  secondaryContainer: '#bfe9cf',
  tertiary: '#225b7a',
  error: '#ba1a1a',
};

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: stitchColors.primary,
      dark: '#004f57',
      light: '#7ad4e2',
      contrastText: '#ffffff',
    },
    secondary: {
      main: stitchColors.secondary,
      light: stitchColors.secondaryContainer,
      contrastText: '#ffffff',
    },
    error: {
      main: stitchColors.error,
    },
    background: {
      default: stitchColors.surface,
      paper: stitchColors.white,
    },
    text: {
      primary: stitchColors.onSurface,
      secondary: stitchColors.onSurfaceVariant,
    },
    divider: stitchColors.outlineVariant,
  },
  typography: {
    fontFamily: ['Inter', 'system-ui', 'sans-serif'].join(','),
    h1: { fontSize: 48, lineHeight: '56px', fontWeight: 700 },
    h2: { fontSize: 32, lineHeight: '40px', fontWeight: 600 },
    h3: { fontSize: 24, lineHeight: '32px', fontWeight: 600 },
    h6: { fontSize: 20, lineHeight: '28px', fontWeight: 500 },
    body1: { fontSize: 16, lineHeight: '24px' },
    body2: { fontSize: 14, lineHeight: '20px' },
    caption: { fontSize: 12, lineHeight: '16px', fontWeight: 600, letterSpacing: '0.05em' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          minHeight: '100vh',
          backgroundColor: stitchColors.surface,
        },
        '#root': {
          minHeight: '100vh',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          minHeight: 40,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${stitchColors.outlineVariant}`,
          boxShadow: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: stitchColors.surfaceLow,
          color: stitchColors.onSurfaceVariant,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        },
      },
    },
  },
});
