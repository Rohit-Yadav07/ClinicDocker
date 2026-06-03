import { createTheme } from '@mui/material/styles';

export const getTheme = (darkMode) =>
  createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#90caf9' : '#1976d2',
      },
      secondary: {
        main: darkMode ? '#f48fb1' : '#ec407a',
      },
      background: {
        default: darkMode ? '#181c24' : '#f5f7fa',
        paper: darkMode ? '#232a36' : '#fff',
      },
    },
    shape: { borderRadius: 16 },
    typography: {
      fontFamily: ['Montserrat', 'Roboto', 'sans-serif'].join(','),
      h2: { fontWeight: 900 },
      h4: { fontWeight: 700 },
    },
  });
