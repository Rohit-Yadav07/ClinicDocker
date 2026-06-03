import React from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { motion } from 'framer-motion';
import BackButton from '../components/BackButton';
import { Link } from 'react-router-dom';
import LogoutButton from '../components/LogoutButton';

const doctorFeatures = [
  {
    title: 'My Profile',
    description: 'View and update your doctor profile.',
    to: '/profile',
    color: '#1976d2',
  },
  {
    title: 'My Appointments',
    description: 'View and manage your appointments.',
    to: '/appointments',
    color: '#43cea2',
  },
  {
    title: 'Patient with medical history',
    description: 'Browse and search for patients with medical history.',
    to: '/getallpatients',
    color: '#ffb347', // changed color to a distinct orange shade
  },
  {
    title: 'Doctors Directory',
    description: 'Browse and search for other doctors.',
    to: '/doctors',
    color: '#f093fb',
  },
  // Add more doctor-specific features as needed
];

const DoctorDashboard = () => (
  <Box sx={{ minHeight: '100vh', backgroundImage: 'url(/clinicbg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', py: 6, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
    <Box sx={{ textAlign: 'center', width: '100%', maxWidth: 1100, mx: 'auto',
         background: 'rgba(217, 235, 241, 0.97)', borderRadius: '2rem', boxShadow: 8, p: { xs: 2, sm: 4 } }}>
      <Box sx={{ textAlign: 'left', mb: 2 }}>
        <BackButton />
      </Box>
      <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: 1, color: 'primary.main', mb: 4 }}>Welcome Doctor</Typography>
      <Grid container spacing={4} justifyContent="center" alignItems="stretch">
        {doctorFeatures.map((feature, idx) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={feature.title} sx={{ display: 'flex' }}>
            <Link to={feature.to} style={{ textDecoration: 'none', flex: 1, width: '100%' }}>
              <motion.div whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.97 }} style={{ height: '100%' }}>
                <Card style={{ background: feature.color, color: '#fff', borderRadius: '1.5rem', minHeight: 200, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" style={{ fontWeight: 700 }}>{feature.title}</Typography>
                    <Typography variant="body2" style={{ margin: '0.5rem 0 1rem 0' }}>{feature.description}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                      <Box sx={{
                        background: 'rgba(255,255,255,0.18)',
                        color: '#fff',
                        px: 3,
                        py: 0.7,
                        borderRadius: 2,
                        fontWeight: 900,
                        fontSize: 20,
                        letterSpacing: 1,
                        boxShadow: 1,
                        textAlign: 'center',
                        minWidth: 60
                      }}>GO</Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Box>
  </Box>
);

export default DoctorDashboard;
