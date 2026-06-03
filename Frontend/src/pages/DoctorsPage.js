import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Avatar,
  TextField,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import BackButton from '../components/BackButton';
import axios from 'axios';

const DoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:8083/api/doctors', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => {
        setDoctors(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load doctors');
        setLoading(false);
      });
  }, []);

  const filteredDoctors = doctors.filter(doc =>
    doc.specialty?.toLowerCase().includes(search.toLowerCase()) ||
    doc.firstName?.toLowerCase().includes(search.toLowerCase()) ||
    doc.lastName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ minHeight: '100vh', backgroundImage: 'url(/clinicbg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', py: 6, display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
      <BackButton />
      <Paper elevation={8} sx={{ p: 4, borderRadius: 4, maxWidth: 900, width: '100%', boxShadow: 6, background: (theme) => theme.palette.background.paper }}>
        <Typography variant="h4" fontWeight={700} gutterBottom align="center">
          Doctors Directory
        </Typography>
        <TextField
          placeholder="Search by name or specialty"
          value={search}
          onChange={e => setSearch(e.target.value)}
          fullWidth
          size="small"
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : filteredDoctors.length === 0 ? (
          <Typography align="center">No doctors found.</Typography>
        ) : (
          <Grid container spacing={3}>
            {filteredDoctors.map(doc => (
              <Grid item xs={12} sm={6} md={4} key={doc.userId}>
                <Card sx={{ borderRadius: 3, boxShadow: 3, background: (theme) => theme.palette.background.paper, height: '100%' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Avatar sx={{ bgcolor: '#1976d2', width: 56, height: 56, mr: 2 }}>
                        <LocalHospitalIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={700}>
                          Dr. {doc.firstName} {doc.lastName}
                        </Typography>
                        <Typography color="text.secondary" fontWeight={500}>
                          {doc.specialty}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      <strong>Consultation Fee:</strong> ₹{doc.consultationFee}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Experience:</strong> {doc.yearsOfExperience || 'N/A'} years
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Box>
  );
};

export default DoctorsPage;
