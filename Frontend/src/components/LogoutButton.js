import React from 'react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };
  return (
    <Button
      color="secondary"
      variant="outlined"
      onClick={handleLogout}
      sx={{
        ml: 2,
        fontWeight: 700,
        borderRadius: '2rem',
        px: 3,
        py: 1,
        fontSize: 16,
        boxShadow: 2,
        background: '#fff',
        transition: 'background 0.3s, color 0.3s, box-shadow 0.3s',
        '&:hover': {
          background: 'linear-gradient(90deg, #43cea2 0%, #1976d2 100%)',
          color: '#fff',
          boxShadow: 4,
          borderColor: '#1976d2'
        }
      }}
    >
      Logout
    </Button>
  );
};

export default LogoutButton;
