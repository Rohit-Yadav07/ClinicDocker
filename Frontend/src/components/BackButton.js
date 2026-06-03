import React from 'react';
import { Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

const BackButton = ({ sx }) => {
  const navigate = useNavigate();
  return (
    <Button
      startIcon={<ArrowBackIcon />}
      variant="outlined"
      color="primary"
      sx={{
        mb: 2,
        borderRadius: '2rem',
        px: 3,
        py: 1,
        fontWeight: 700,
        fontSize: 16,
        boxShadow: 1,
        background: '#fff',
        transition: 'background 0.3s, color 0.3s, box-shadow 0.3s',
        '&:hover': {
          background: 'linear-gradient(90deg, #43cea2 0%, #1976d2 100%)',
          color: '#fff',
          boxShadow: 4,
          borderColor: '#1976d2'
        },
        ...sx
      }}
      onClick={() => navigate(-1)}
    >
      Back
    </Button>
  );
};

export default BackButton;