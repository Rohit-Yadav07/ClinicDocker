import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
  Button,
  Snackbar
} from '@mui/material';
import BackButton from '../components/BackButton';
import axios from 'axios';
import { motion } from 'framer-motion';

const MedicalHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newEntry, setNewEntry] = useState('');
  const [adding, setAdding] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    // Only fetch for patients
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.role?.toUpperCase() !== 'PATIENT') return;
    setLoading(true);
    axios.get('http://localhost:8082/api/patients/me/medical-history', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => {
        setHistory(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('No medical history available. Kindly add your medical history.');
        setLoading(false);
      });
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.role?.toUpperCase() !== 'PATIENT') return;
    if (!newEntry.trim()) return;
    setAdding(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:8082/api/patients/me/medical-history', null, {
        params: { description: newEntry },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setHistory([res.data, ...history]);
      setNewEntry('');
      setSnackbar({ open: true, message: 'Entry added!', severity: 'success' });
    } catch (err) {
      setError('Failed to add entry');
      setSnackbar({ open: true, message: 'Failed to add entry', severity: 'error' });
    }
    setAdding(false);
  };

  return (
    <Box component={motion.div} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} sx={{ minHeight: '100vh', backgroundImage: 'url(/clinicbg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', py: 6, display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
      <BackButton />
      <Paper elevation={12} sx={{ p: 4, borderRadius: 4, maxWidth: 650, width: '100%', boxShadow: 10, background: (theme) => theme.palette.background.paper }}>
        <Typography variant="h3" fontWeight={900} gutterBottom align="center" sx={{ letterSpacing: 1, background: 'linear-gradient(90deg, #1976d2 0%, #ec407a 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Medical History
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <TextField
            label="Add New Entry"
            value={newEntry}
            onChange={e => setNewEntry(e.target.value)}
            fullWidth
            size="medium"
            disabled={adding}
            variant="outlined"
            sx={{ background: (theme) => theme.palette.background.default, borderRadius: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            disabled={adding || !newEntry.trim()}
            sx={{ minWidth: 120, fontWeight: 700, fontSize: 18, borderRadius: 2, boxShadow: 3 }}
          >
            {adding ? 'Adding...' : 'Add'}
          </Button>
        </form>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress size={48} thickness={5} color="secondary" />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ fontWeight: 600, fontSize: 18 }}>{error}</Alert>
        ) : history.length === 0 ? (
          <Typography align="center" sx={{ fontSize: 20, color: '#888' }}>No medical history found.</Typography>
        ) : (
          <List sx={{ maxHeight: 400, overflowY: 'auto', pr: 1 }}>
            {history.map((entry, idx) => (
              <motion.div key={entry.id || idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                <ListItem alignItems="flex-start" sx={{ mb: 2, borderRadius: 2, background: (theme) => theme.palette.background.paper, boxShadow: 2, transition: 'box-shadow 0.3s, transform 0.3s' }}>
                  <ListItemText
                    primary={<Typography fontWeight={700} fontSize={18}>{entry.description}</Typography>}
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {entry.recordedAt ? new Date(entry.recordedAt).toLocaleString() : 'Unknown date'}
                      </Typography>
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
    </Box>
  );
};

export default MedicalHistoryPage;
