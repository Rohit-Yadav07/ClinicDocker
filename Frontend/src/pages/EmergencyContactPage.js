import React, { useEffect, useState } from 'react';
import { Typography, Box, Paper, TextField, Button, CircularProgress, Alert, Divider } from '@mui/material';
import BackButton from '../components/BackButton';
import axios from 'axios';

const EmergencyContactPage = () => {
  const [contact, setContact] = useState({ name: '', number: '' });
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Only fetch for patients
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.role?.toUpperCase() !== 'PATIENT') return;
    setLoading(true);
    const token = localStorage.getItem('token');
    axios.get('http://localhost:8082/api/patients/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setContact({
          name: res.data.emergencyContactName || '',
          number: res.data.emergencyContactNumber || ''
        });
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load emergency contact');
        setLoading(false);
      });
  }, []);

  const handleChange = e => {
    setContact({ ...contact, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.role?.toUpperCase() !== 'PATIENT') return;
    setSaving(true);
    setError('');
    setSuccess(false);
    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost:8082/api/patients/me/emergency-contact', null, {
        params: { name: contact.name, number: contact.number },
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(true);
      setEditMode(false);
    } catch {
      setError('Failed to update emergency contact');
    }
    setSaving(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundImage: 'url(/clinicbg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', py: 6, display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
      <Paper elevation={10} sx={{ p: 4, borderRadius: 4, maxWidth: 500, width: '100%', boxShadow: 6, background: (theme) => theme.palette.background.paper }}>
        <BackButton />
        <Typography variant="h4" fontWeight={700} gutterBottom align="center">Emergency Contact</Typography>
        <Divider sx={{ mb: 3 }} />
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
            <TextField
              label="Contact Name"
              name="name"
              value={contact.name}
              onChange={handleChange}
              fullWidth
              margin="normal"
              disabled={!editMode}
            />
            <TextField
              label="Contact Number"
              name="number"
              value={contact.number}
              onChange={handleChange}
              fullWidth
              margin="normal"
              disabled={!editMode}
            />
            {success && <Alert severity="success" sx={{ mt: 2 }}>Emergency contact updated!</Alert>}
            <Box display="flex" justifyContent="center" gap={2} mt={3}>
              {editMode ? (
                <>
                  <Button variant="contained" color="primary" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button variant="outlined" color="secondary" onClick={() => setEditMode(false)} disabled={saving}>
                    Cancel
                  </Button>
                </>
              ) : (
                <Button variant="contained" onClick={() => setEditMode(true)}>
                  Edit
                </Button>
              )}
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default EmergencyContactPage;
