import React, { useEffect, useState } from 'react';
import { Typography, Box, Paper, CircularProgress, Alert, TextField, Grid, Divider, List, ListItem, ListItemText, Collapse, IconButton, Card, CardContent, Avatar, Tooltip, Chip, Badge } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SearchIcon from '@mui/icons-material/Search';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import PersonIcon from '@mui/icons-material/Person';
import BackButton from '../components/BackButton';
import LogoutButton from '../components/LogoutButton';
import { getAllPatients } from '../api';
import { motion } from 'framer-motion';

const AllPatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await getAllPatients({
          headers: { Authorization: `Bearer ${token}` }
        });
        setPatients(res.data);
      } catch (err) {
        setError('Failed to load patients');
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  // Filter patients by search
  const filteredPatients = patients.filter((patient) => {
    const searchLower = search.toLowerCase();
    return (
      (patient.firstName && patient.firstName.toLowerCase().includes(searchLower)) ||
      (patient.lastName && patient.lastName.toLowerCase().includes(searchLower)) ||
      (patient.userId && patient.userId.toString().includes(searchLower))
    );
  });

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      sx={{ backgroundImage: 'url(/clinicbg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', py: 1, px: 1 }}
    >
      <Paper
        elevation={16}
        sx={{
          p: 0.5,
          borderRadius: 2,
          maxWidth: 1200,
          width: '100%',
          mx: 'auto',
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}
      >
        <Box sx={{ textAlign: 'left', mb: 0.5, ml: 2 }}>
          <BackButton />
        </Box>

        <Box sx={{ textAlign: 'center', mb: 1 }}>
          <Typography
            variant="h3"
            fontWeight={900}
            sx={{
              background: 'linear-gradient(90deg, #1976d2 0%, #43cea2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}
          >
            Patient Directory
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Manage and view patient medical histories
          </Typography>
        </Box>

        <Box sx={{ mb: 1, position: 'relative' }}>
          <TextField
            label="Search patients by name or ID"
            variant="outlined"
            fullWidth
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: '#f8f9fa',
                '&:hover': {
                  backgroundColor: '#fff'
                }
              }
            }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              style: { fontSize: 16, fontWeight: 500 }
            }}
          />
          {filteredPatients.length > 0 && (
            <Chip
              label={`${filteredPatients.length} patient${filteredPatients.length !== 1 ? 's' : ''} found`}
              color="primary"
              size="small"
              sx={{ position: 'absolute', top: -10, right: 10, fontSize: 12 }}
            />
          )}
        </Box>
        {loading ? (
          <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight={300}>
            <CircularProgress size={60} thickness={4} sx={{ mb: 2 }} />
            <Typography variant="h6" color="text.secondary">Loading patients...</Typography>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: 3, mb: 3 }}>{error}</Alert>
        ) : filteredPatients.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <MedicalServicesIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" sx={{ mb: 1 }}>No patients found</Typography>
            <Typography color="text.disabled">Try adjusting your search criteria</Typography>
          </Box>
        ) : (
          <Grid container spacing={4} sx={{ width: '100%', margin: 0 }}>
            {filteredPatients.map((patient, idx) => {
              const isExpanded = expanded === (patient.userId || idx);
              const age = patient.dateOfBirth ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() : null;
              const hasHistory = patient.medicalHistory && patient.medicalHistory.length > 0;

              return (
                <Grid item xs={12} sm={6} lg={4} key={patient.userId || idx}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                    whileHover={{ y: -8 }}
                  >
                    <Card
                      sx={{
                        borderRadius: 4,
                        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                        minHeight: 380,
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        overflow: 'hidden',
                        border: '1px solid rgba(0,0,0,0.08)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                          borderColor: 'primary.main',
                        },
                      }}
                    >
                      <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        {/* Card Header with Avatar */}
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          p: 3,
                          background: 'linear-gradient(135deg, rgba(25,118,210,0.1) 0%, rgba(67,206,162,0.1) 100%)',
                          position: 'relative'
                        }}>
                          <Avatar sx={{
                            bgcolor: 'primary.main',
                            width: 64,
                            height: 64,
                            boxShadow: '0 8px 16px rgba(25,118,210,0.3)',
                            border: '3px solid #fff'
                          }}>
                            <PersonIcon sx={{ fontSize: 36 }} />
                          </Avatar>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="h6" fontWeight={700} color="primary.main" sx={{
                              fontSize: 18,
                              mb: 0.5,
                              lineHeight: 1.2
                            }}>
                              {patient.firstName} {patient.lastName}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip
                                label={`ID: ${patient.userId}`}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: 11 }}
                              />
                              {hasHistory && (
                                <Badge
                                  badgeContent={patient.medicalHistory.length}
                                  color="secondary"
                                  sx={{ '& .MuiBadge-badge': { fontSize: 10 } }}
                                >
                                  <MedicalServicesIcon sx={{ fontSize: 16, color: 'success.main' }} />
                                </Badge>
                              )}
                            </Box>
                          </Box>
                        </Box>
                        {/* Card Content */}
                        <Box sx={{ flex: 1, px: 3, py: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <Box sx={{ textAlign: 'center', p: 1.5, borderRadius: 2, bgcolor: 'rgba(25,118,210,0.05)' }}>
                                <Typography variant="h6" fontWeight={700} color="primary.main">
                                  {age || 'N/A'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">Age</Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6}>
                              <Box sx={{ textAlign: 'center', p: 1.5, borderRadius: 2, bgcolor: 'rgba(67,206,162,0.05)' }}>
                                <Typography variant="h6" fontWeight={700} color="success.main">
                                  {patient.gender || 'N/A'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">Gender</Typography>
                              </Box>
                            </Grid>
                          </Grid>

                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2" color="text.secondary">Blood Type:</Typography>
                              <Chip
                                label={patient.bloodType || 'Unknown'}
                                size="small"
                                color={patient.bloodType ? 'error' : 'default'}
                                variant="outlined"
                              />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2" color="text.secondary">Insurance:</Typography>
                              <Typography variant="body2" fontWeight={500} sx={{ maxWidth: '60%', textAlign: 'right' }}>
                                {patient.insuranceProvider || 'None'}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        <Divider sx={{ mx: 2 }} />
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          px: 3,
                          py: 2,
                          background: hasHistory ? 'rgba(76,175,80,0.05)' : 'rgba(158,158,158,0.05)',
                          cursor: 'pointer',
                          '&:hover': {
                            background: hasHistory ? 'rgba(76,175,80,0.1)' : 'rgba(158,158,158,0.1)'
                          }
                        }}
                          onClick={e => { e.stopPropagation(); setExpanded(isExpanded ? null : (patient.userId || idx)); }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <MedicalServicesIcon sx={{
                              fontSize: 18,
                              color: hasHistory ? 'success.main' : 'text.disabled'
                            }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>Medical History</Typography>
                            {hasHistory && (
                              <Chip
                                label={patient.medicalHistory.length}
                                size="small"
                                color="success"
                                sx={{ height: 20, fontSize: 11 }}
                              />
                            )}
                          </Box>
                          <IconButton size="small">
                            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        </Box>
                        <Collapse in={isExpanded} timeout={300} unmountOnExit>
                          {hasHistory ? (
                            <Box sx={{
                              maxHeight: 200,
                              overflowY: 'auto',
                              background: 'linear-gradient(145deg, rgba(76,175,80,0.02) 0%, rgba(76,175,80,0.05) 100%)',
                              mx: 2,
                              mb: 2,
                              borderRadius: 2,
                              border: '1px solid rgba(76,175,80,0.2)'
                            }}>
                              <List dense sx={{ py: 1 }}>
                                {patient.medicalHistory.map((mh, historyIdx) => (
                                  <motion.div
                                    key={mh.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: historyIdx * 0.1 }}
                                  >
                                    <ListItem sx={{
                                      py: 1,
                                      px: 2,
                                      borderRadius: 1,
                                      mb: 0.5,
                                      '&:hover': {
                                        background: 'rgba(76,175,80,0.08)'
                                      }
                                    }}>
                                      <ListItemText
                                        primary={
                                          <Typography variant="body2" sx={{
                                            fontWeight: 500,
                                            color: 'text.primary',
                                            lineHeight: 1.4
                                          }}>
                                            {mh.description}
                                          </Typography>
                                        }
                                        secondary={
                                          <Typography variant="caption" sx={{
                                            color: 'success.main',
                                            fontWeight: 500,
                                            mt: 0.5,
                                            display: 'block'
                                          }}>
                                            {new Date(mh.recordedAt).toLocaleDateString('en-US', {
                                              year: 'numeric',
                                              month: 'short',
                                              day: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            })}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  </motion.div>
                                ))}
                              </List>
                            </Box>
                          ) : (
                            <Box sx={{ textAlign: 'center', py: 3, px: 3 }}>
                              <MedicalServicesIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                              <Typography variant="body2" color="text.secondary">No medical history available</Typography>
                            </Box>
                          )}
                        </Collapse>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Paper>
    </Box>
  );
};

export default AllPatientsPage;
