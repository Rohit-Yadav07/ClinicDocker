import React from 'react';
import { IconButton, useTheme } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

const ThemeToggle = ({ darkMode, onToggle }) => {
  const theme = useTheme();
  return (
    <IconButton onClick={onToggle} sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 2000, background: theme.palette.background.paper }}>
      {darkMode ? <LightModeIcon color="warning" /> : <DarkModeIcon color="primary" />}
    </IconButton>
  );
};

export default ThemeToggle;
