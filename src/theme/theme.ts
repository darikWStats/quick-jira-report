import { createTheme } from '@mui/material/styles';

// Create Material-UI theme
export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
      marginBottom: '1.5rem',
    },
    h6: {
      fontWeight: 500,
      marginBottom: '1rem',
    },
  },
});
