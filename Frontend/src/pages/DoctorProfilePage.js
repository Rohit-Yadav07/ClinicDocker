import React, { useEffect, useState } from 'react';
import { Typography, Box, Paper, CircularProgress, Alert, Avatar, Grid, Divider, Button, TextField, Snackbar } from '@mui/material';
import axios from 'axios';
import BackButton from '../components/BackButton';

const DoctorProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editProfile, setEditProfile] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem('token');
    axios.get('http://localhost:8083/api/doctors/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setProfile(res.data);
        setEditProfile(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load profile');
        setLoading(false);
      });
  }, []);

  const handleEditChange = (e) => {
    setEditProfile({ ...editProfile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.put('http://localhost:8083/api/doctors/me', editProfile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data);
      setEditMode(false);
      setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update profile.', severity: 'error' });
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg,rgb(147, 208, 251) 0%, #43cea2 100%)', py: 6, display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
      <Paper elevation={12} sx={{ p: 4, borderRadius: 6, maxWidth: 650, width: '100%', boxShadow: 10, background: (theme) => theme.palette.background.paper }}>
        <BackButton />
        <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
          <Avatar sx={{ width: 110, height: 110, bgcolor: '#1976d2', fontSize: 44, mb: 2, boxShadow: 3 }}>
            {profile?.firstName ? profile.firstName[0] : ''}
          </Avatar>
          <Typography variant="h3" fontWeight={900} gutterBottom>Doctor Profile</Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress size={48} thickness={5} color="secondary" />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : profile ? (
          <Box>
            <Grid container spacing={3}>
              {/* Editable fields */}
              <Grid item xs={5}><Typography color="text.secondary" fontWeight={600}>Full Name:</Typography></Grid>
              <Grid item xs={7}>
                {editMode ? (
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField name="firstName" label="First Name" value={editProfile.firstName || ''} onChange={handleEditChange} size="small" fullWidth />
                    <TextField name="lastName" label="Last Name" value={editProfile.lastName || ''} onChange={handleEditChange} size="small" fullWidth />
                  </Box>
                ) : (
                  `${profile.firstName} ${profile.lastName}`
                )}
              </Grid>
              <Grid item xs={5}><Typography color="text.secondary" fontWeight={600}>Doctor ID:</Typography></Grid>
              <Grid item xs={7}><Typography>{profile.userId}</Typography></Grid>
              <Grid item xs={5}><Typography color="text.secondary" fontWeight={600}>Specialty:</Typography></Grid>
              <Grid item xs={7}>
                {editMode ? (
                  <TextField name="specialty" label="Specialty" value={editProfile.specialty || ''} onChange={handleEditChange} size="small" />
                ) : profile.specialty}
              </Grid>
              <Grid item xs={5}><Typography color="text.secondary" fontWeight={600}>Consultation Fee:</Typography></Grid>
              <Grid item xs={7}>
                {editMode ? (
                  <TextField name="consultationFee" label="Consultation Fee" value={editProfile.consultationFee || ''} onChange={handleEditChange} size="small" type="number" />
                ) : (profile.consultationFee ? `₹${profile.consultationFee}` : 'N/A')}
              </Grid>
              <Grid item xs={5}><Typography color="text.secondary" fontWeight={600}>Availability:</Typography></Grid>
              <Grid item xs={7}>
                {editMode ? (
                  <TextField name="availability" label="Availability" value={editProfile.availability || ''} onChange={handleEditChange} size="small" />
                ) : (profile.availability || 'N/A')}
              </Grid>
              <Grid item xs={5}><Typography color="text.secondary" fontWeight={600}>License Number:</Typography></Grid>
              <Grid item xs={7}>
                {editMode ? (
                  <TextField name="licenseNumber" label="License Number" value={editProfile.licenseNumber || ''} onChange={handleEditChange} size="small" />
                ) : (profile.licenseNumber || 'N/A')}
              </Grid>
              <Grid item xs={5}><Typography color="text.secondary" fontWeight={600}>Qualifications:</Typography></Grid>
              <Grid item xs={7}>
                {editMode ? (
                  <TextField name="qualifications" label="Qualifications" value={editProfile.qualifications || ''} onChange={handleEditChange} size="small" />
                ) : (profile.qualifications || 'N/A')}
              </Grid>
              <Grid item xs={5}><Typography color="text.secondary" fontWeight={600}>Years of Experience:</Typography></Grid>
              <Grid item xs={7}>
                {editMode ? (
                  <TextField name="yearsOfExperience" label="Years of Experience" value={editProfile.yearsOfExperience || ''} onChange={handleEditChange} size="small" type="number" />
                ) : (profile.yearsOfExperience !== undefined ? profile.yearsOfExperience : 'N/A')}
              </Grid>
            </Grid>
            <Box mt={4} display="flex" justifyContent="flex-end" gap={2}>
              {editMode ? (
                <>
                  <Button variant="contained" color="primary" onClick={handleSave}>Save</Button>
                  <Button variant="outlined" color="secondary" onClick={() => { setEditMode(false); setEditProfile(profile); }}>Cancel</Button>
                </>
              ) : (
                <Button variant="contained" color="primary" onClick={() => setEditMode(true)}>Edit</Button>
              )}
            </Box>
          </Box>
        ) : null}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          message={snackbar.message}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </Paper>
    </Box>
  );
};

export default DoctorProfilePage;
