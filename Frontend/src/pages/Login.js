import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Button, TextField, Typography, Box, Paper } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      console.log('Attempting login with username:', username); // Debugging line
      const res = await axios.post('http://localhost:8081/api/auth/login', null, {
        params: { username, password }
      });
      // Save JWT token to localStorage for authenticated requests
      localStorage.setItem('token', res.data);
      console.log('Login successful, token received:', res.data); // Debugging line 
      // Fetch user profile to get role
      let userProfile = null;
      let userRole = null;
      let user = null;
      try {
        // Try patient endpoint first
        const patientRes = await axios.get('http://localhost:8082/api/patients/me', {
          headers: { Authorization: `Bearer ${res.data}` }
        });
        const patientId = patientRes.data.id;
        console.log('Patient ID:', patientId); // Debugging line
        userProfile = patientRes.data;
        userRole = 'PATIENT';
        user = { ...userProfile, role: userRole };
      } catch (err) {
        // If patient endpoint fails, try doctor endpoint
        try {
          const doctorRes = await axios.get('http://localhost:8083/api/doctors/me', {
            headers: { Authorization: `Bearer ${res.data}` }
          });
          console.log('Doctor ID:', doctorRes.data.id); // Debugging line
          userProfile = doctorRes.data;
          userRole = 'DOCTOR';
          user = { ...userProfile, role: userRole };
        } catch (err2) {
          setError('Failed to fetch user profile.');
          return;
        }
      }
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/home');
      window.location.reload(); // Force reload to update App.js with new role
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <Box className="auth-bg">
      <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
        <Paper elevation={8} className="auth-paper">
          <Typography variant="h4" className="auth-title">Welcome Back!</Typography>
          <form className="auth-form" onSubmit={handleSubmit}>
            <TextField label="Username" variant="outlined" fullWidth margin="normal" value={username} onChange={e => setUsername(e.target.value)} required />
            <TextField label="Password" type="password" variant="outlined" fullWidth margin="normal" value={password} onChange={e => setPassword(e.target.value)} required />
            {error && <Typography color="error" style={{ marginTop: 8 }}>{error}</Typography>}
            <Button variant="contained" color="primary" fullWidth className="auth-btn" type="submit" disabled={!username || !password}>Login</Button>
          </form>
          <Typography variant="body2" align="center" className="auth-link">
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </Typography>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default Login;
