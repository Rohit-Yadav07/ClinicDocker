import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Avatar,
  Stack
} from '@mui/material';
import axios from 'axios';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import BackButton from '../components/BackButton';
import { motion } from 'framer-motion';
import Snackbar from '@mui/material/Snackbar';
import LogoutButton from '../components/LogoutButton';

const formatDateTime = (dateTimeStr) => {
  const date = new Date(dateTimeStr);
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
};

const getStatusColor = (status) => {
  switch (status) {
    case 'SCHEDULED':
      return 'primary';
    case 'COMPLETED':
      return 'success';
    case 'CANCELLED':
      return 'error';
    default:
      return 'default';
  }
};

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    axios.get('http://localhost:8085/api/appointments/me', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => {
        setAppointments(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load appointments');
        setLoading(false);
      });
  }, []);

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      sx={{
        minHeight: '100vh',
        backgroundImage: 'url(/clinicbg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        py: 6,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start'
      }}
    >
      <Paper
        elevation={12}
        sx={{
          padding: 4,
          borderRadius: 6,
          maxWidth: 750,
          width: '100%',
          boxShadow: 10,
          background: (theme) => theme.palette.background.paper
        }}
      >
        <BackButton />
        <Typography variant="h3" fontWeight={900} gutterBottom align="center" sx={{ letterSpacing: 1, background: 'linear-gradient(90deg, #1976d2 0%, #ec407a 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          My Appointments
        </Typography>
        <Divider sx={{ mb: 3 }} />
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress size={48} thickness={5} color="secondary" />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : appointments.length === 0 ? (
          <Typography align="center" sx={{ fontSize: 20, color: '#888' }}>No appointments found.</Typography>
        ) : (
          <List sx={{ maxHeight: 500, overflowY: 'auto', pr: 1 }}>
            {appointments.map((app, idx) => (
              <motion.div key={app.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    background: (theme) => theme.palette.background.default,
                    boxShadow: 2,
                    transition: 'box-shadow 0.3s, transform 0.3s'
                  }}
                  secondaryAction={
                    <Chip
                      label={app.status}
                      color={getStatusColor(app.status)}
                      sx={{ fontWeight: 600, fontSize: 14 }}
                    />
                  }
                >
                  <Avatar sx={{ bgcolor: '#1976d2', mr: 2 }}>
                    <PersonIcon />
                  </Avatar>
                  <ListItemText
                    primary={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography fontWeight={600}>
                          Doctor ID: {app.doctorId}
                        </Typography>
                        <Typography fontWeight={600}>
                          Patient ID: {app.patientId}
                        </Typography>
                        <EventIcon fontSize="small" sx={{ ml: 2, mr: 0.5, color: '#1976d2' }} />
                        <Typography color="text.secondary">
                          {formatDateTime(app.appointmentTime)}
                        </Typography>
                      </Stack>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Status:</strong> {app.status}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Notes:</strong> {app.notes || 'None'}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                <Divider />
              </motion.div>
            ))}
          </List>
        )}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          message={snackbar.message}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </Paper>
      <Box sx={{ position: 'absolute', top: 24, right: 32, zIndex: 1200 }}>
      </Box>
    </Box>
  );
};

export default AppointmentsPage;
