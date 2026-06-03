import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Avatar,
  Grid,
  Button,
  TextField,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import axios from 'axios';
import BackButton from '../components/BackButton';
import { motion } from 'framer-motion';
import Snackbar from '@mui/material/Snackbar';
import LogoutButton from '../components/LogoutButton';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editProfile, setEditProfile] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem('token');
    let user = JSON.parse(localStorage.getItem('user') || '{}');

    // If user role is not available, decode from token
    if (!user.role && token) {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      user.role = tokenPayload.role;
    }

    const url = user.role === 'DOCTOR'
      ? 'http://localhost:8083/api/doctors/me'
      : 'http://localhost:8082/api/patients/me';

    axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
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
    let user = JSON.parse(localStorage.getItem('user') || '{}');

    // If user role is not available, decode from token
    if (!user.role && token) {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      user.role = tokenPayload.role;
    }

    const url = user.role === 'DOCTOR'
      ? 'http://localhost:8083/api/doctors/me'
      : 'http://localhost:8082/api/patients/me';

    try {
      const res = await axios.put(url, editProfile, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setProfile(res.data);
      setEditMode(false);
      setError('');
      setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
    } catch (err) {
      setError('Failed to update profile');
      setSnackbar({ open: true, message: 'Failed to update profile', severity: 'error' });
    }
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      sx={{ minHeight: '100vh', backgroundImage: 'url(/clinicbg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', py: 6, display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}
    >
      <Paper
        elevation={12}
        sx={{
          padding: 4,
          borderRadius: 6,
          maxWidth: 650,
          width: '100%',
          boxShadow: 10,
          background: (theme) => theme.palette.background.paper
        }}
      >
        <BackButton />
        <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
          <Avatar sx={{ width: 110, height: 110, bgcolor: '#1976d2', fontSize: 44, mb: 2, boxShadow: 3 }}>
            {profile?.firstName ? profile.firstName[0] : ''}
          </Avatar>
          <Typography variant="h3" fontWeight={900} gutterBottom sx={{ letterSpacing: 1, background: 'linear-gradient(90deg, #1976d2 0%, #ec407a 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            My Profile
          </Typography>
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
            <Grid container spacing={2}>
              <Grid item xs={5}>
                <Typography color="text.secondary" fontWeight={600}>Full Name:</Typography>
              </Grid>
              <Grid item xs={7}>
                {editMode ? (
                  <Box display="flex" gap={1}>
                    <TextField
                      name="firstName"
                      label="First Name"
                      value={editProfile.firstName || ''}
                      onChange={handleEditChange}
                      size="small"
                      margin="dense"
                      fullWidth
                    />
                    <TextField
                      name="lastName"
                      label="Last Name"
                      value={editProfile.lastName || ''}
                      onChange={handleEditChange}
                      size="small"
                      margin="dense"
                      fullWidth
                    />
                  </Box>
                ) : (
                  <Typography>{profile.firstName} {profile.lastName}</Typography>
                )}
              </Grid>

              <Grid item xs={5}><Typography color="text.secondary" fontWeight={600}>User ID:</Typography></Grid>
              <Grid item xs={7}><Typography>{profile.userId}</Typography></Grid>

              <Grid item xs={5}><Typography color="text.secondary" fontWeight={600}>Date of Birth:</Typography></Grid>
              <Grid item xs={7}>
                {editMode ? (
                  <TextField
                    name="dateOfBirth"
                    type="date"
                    value={editProfile.dateOfBirth || ''}
                    onChange={handleEditChange}
                    size="small"
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                ) : (
                  <Typography>{profile.dateOfBirth}</Typography>
                )}
              </Grid>

              <Grid item xs={5}><Typography color="text.secondary" fontWeight={600}>Gender:</Typography></Grid>
              <Grid item xs={7}>
                {editMode ? (
                  <FormControl size="small" margin="dense" fullWidth>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      name="gender"
                      value={editProfile.gender || ''}
                      onChange={handleEditChange}
                      label="Gender"
                    >
                      <MenuItem value="MALE">Male</MenuItem>
                      <MenuItem value="FEMALE">Female</MenuItem>
                      <MenuItem value="OTHER">Other</MenuItem>
                    </Select>
                  </FormControl>
                ) : (
                  <Typography>{profile.gender}</Typography>
                )}
              </Grid>

              <Grid item xs={5}><Typography color="text.secondary" fontWeight={600}>Address:</Typography></Grid>
              <Grid item xs={7}>
                {editMode ? (
                  <TextField
                    name="address"
                    value={editProfile.address || ''}
                    onChange={handleEditChange}
                    size="small"
                    margin="dense"
                    fullWidth
                  />
                ) : (
                  <Typography>{profile.address}</Typography>
                )}
              </Grid>

              <Grid item xs={5}><Typography color="text.secondary" fontWeight={600}>Contact Number:</Typography></Grid>
              <Grid item xs={7}>
                {editMode ? (
                  <TextField
                    name="contactNumber"
                    value={editProfile.contactNumber || ''}
                    onChange={handleEditChange}
                    size="small"
                    margin="dense"
                    fullWidth
                  />
                ) : (
                  <Typography>{profile.contactNumber}</Typography>
                )}
              </Grid>

              <Grid item xs={5}><Typography color="text.secondary" fontWeight={600}>Blood Type:</Typography></Grid>
              <Grid item xs={7}>
                {editMode ? (
                  <TextField
                    name="bloodType"
                    value={editProfile.bloodType || ''}
                    onChange={handleEditChange}
                    size="small"
                    margin="dense"
                    fullWidth
                  />
                ) : (
                  <Typography>{profile.bloodType}</Typography>
                )}
              </Grid>

              <Grid item xs={5}><Typography color="text.secondary" fontWeight={600}>Insurance Provider:</Typography></Grid>
              <Grid item xs={7}>
                {editMode ? (
                  <TextField
                    name="insuranceProvider"
                    value={editProfile.insuranceProvider || ''}
                    onChange={handleEditChange}
                    size="small"
                    margin="dense"
                    fullWidth
                  />
                ) : (
                  <Typography>{profile.insuranceProvider}</Typography>
                )}
              </Grid>

              <Grid item xs={5}><Typography color="text.secondary" fontWeight={600}>Insurance Policy #:</Typography></Grid>
              <Grid item xs={7}>
                {editMode ? (
                  <TextField
                    name="insurancePolicyNumber"
                    value={editProfile.insurancePolicyNumber || ''}
                    onChange={handleEditChange}
                    size="small"
                    margin="dense"
                    fullWidth
                  />
                ) : (
                  <Typography>{profile.insurancePolicyNumber}</Typography>
                )}
              </Grid>

              <Grid item xs={5}><Typography color="text.secondary" fontWeight={600}>Emergency Contact Name:</Typography></Grid>
              <Grid item xs={7}>
                {editMode ? (
                  <TextField
                    name="emergencyContactName"
                    value={editProfile.emergencyContactName || ''}
                    onChange={handleEditChange}
                    size="small"
                    margin="dense"
                    fullWidth
                  />
                ) : (
                  <Typography>{profile.emergencyContactName}</Typography>
                )}
              </Grid>

              <Grid item xs={5}><Typography color="text.secondary" fontWeight={600}>Emergency Contact Number:</Typography></Grid>
              <Grid item xs={7}>
                {editMode ? (
                  <TextField
                    name="emergencyContactNumber"
                    value={editProfile.emergencyContactNumber || ''}
                    onChange={handleEditChange}
                    size="small"
                    margin="dense"
                    fullWidth
                  />
                ) : (
                  <Typography>{profile.emergencyContactNumber}</Typography>
                )}
              </Grid>
            </Grid>
            <Divider sx={{ my: 3 }} />
            <Box display="flex" justifyContent="center" gap={2}>
              {editMode ? (
                <>
                  <Button variant="contained" color="primary" onClick={handleSave} sx={{ fontWeight: 700, px: 4, borderRadius: 3 }}>
                    Save
                  </Button>
                  <Button variant="outlined" color="secondary" onClick={() => setEditMode(false)} sx={{ fontWeight: 700, px: 4, borderRadius: 3 }}>
                    Cancel
                  </Button>
                </>
              ) : (
                <Button variant="contained" onClick={() => setEditMode(true)} sx={{ fontWeight: 700, px: 4, borderRadius: 3 }}>
                  Edit
                </Button>
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

export default ProfilePage;
