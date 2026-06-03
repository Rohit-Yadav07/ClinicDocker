import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  TextField,
  Button,
  MenuItem,
  Paper,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import NotesIcon from '@mui/icons-material/Notes';
import axios from 'axios';
import BackButton from '../components/BackButton';

const BookAppointmentPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingDoctors, setFetchingDoctors] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setFetchingDoctors(true);
    axios.get('http://localhost:8083/api/doctors', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => {
        console.log(res.data); // Add this line
        setDoctors(res.data);
        setFetchingDoctors(false);
      })
      .catch(() => {
        setError('Failed to load doctors');
        setFetchingDoctors(false);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await axios.post('http://localhost:8085/api/appointments', {
        doctorId: selectedDoctor,
        appointmentTime,
        notes
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSuccess('Appointment booked successfully!');
      setSelectedDoctor('');
      setAppointmentTime('');
      setNotes('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment');
    }
    setLoading(false);
  };

  return (
    <Box
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
        elevation={8}
        sx={{
          padding: 4,
          borderRadius: 4,
          maxWidth: 480,
          width: '100%',
          boxShadow: 6,
          background: (theme) => theme.palette.background.paper
        }}
      >
        <BackButton />
        <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
          <EventAvailableIcon sx={{ fontSize: 48, color: '#1976d2', mb: 1 }} />
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Book Appointment
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        {fetchingDoctors ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            <TextField
              select
              label="Select Doctor"
              value={selectedDoctor}
              onChange={e => setSelectedDoctor(e.target.value)}
              fullWidth
              margin="normal"
              required
            >
              {doctors.map(doc => (
                <MenuItem key={doc.userId} value={doc.userId}>
                  {doc.firstName} {doc.lastName} ({doc.specialty})
                </MenuItem>
              ))}
            </TextField>

            {selectedDoctor && (() => {
              const doc = doctors.find(d => d.userId === selectedDoctor);
              return doc ? (
                <Box mt={1} mb={2}>
                  <Typography variant="subtitle1" color="primary">
                    Consultation Fee: <strong>₹{doc.consultationFee}</strong>
                  </Typography>
                </Box>
              ) : null;
            })()}

            <TextField
              label={
                <Box display="flex" alignItems="center">
                  <EventAvailableIcon sx={{ mr: 1, fontSize: 20 }} />
                  Appointment Time
                </Box>
              }
              type="datetime-local"
              value={appointmentTime}
              onChange={e => setAppointmentTime(e.target.value)}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
              inputProps={{
                min: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
                step: 60 // 1 minute steps
              }}
              error={Boolean(appointmentTime && new Date(appointmentTime) < new Date(Date.now() - new Date().getTimezoneOffset() * 60000))}
              helperText={
                appointmentTime && new Date(appointmentTime) < new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
                  ? 'Please select a future date and time.'
                  : ''
              }
            />
            <TextField
              label={
                <Box display="flex" alignItems="center">
                  <NotesIcon sx={{ mr: 1, fontSize: 20 }} />
                  Notes
                </Box>
              }
              value={notes}
              onChange={e => setNotes(e.target.value)}
              fullWidth
              margin="normal"
              multiline
              rows={2}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              sx={{ mt: 2, py: 1.2, fontWeight: 600, fontSize: 16 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Book Appointment'}
            </Button>
          </form>
        )}
      </Paper>
    </Box>
  );
};

export default BookAppointmentPage;
