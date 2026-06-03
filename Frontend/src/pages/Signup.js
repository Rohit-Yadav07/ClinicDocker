import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button, TextField, Typography, Box, Paper, Radio, RadioGroup, FormControlLabel, FormLabel } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';
import BackButton from '../components/BackButton';

const Signup = () => {
  const [role, setRole] = useState('PATIENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('http://localhost:8081/api/auth/register', {
        username: name,
        password,
        email,
        role
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <Box className="auth-bg">
      <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
        <Paper elevation={8} className="auth-paper">
          <BackButton />
          <Typography variant="h4" className="auth-title">Create Account</Typography>
          <form className="auth-form" onSubmit={handleSubmit}>
            <TextField label="Name" variant="outlined" fullWidth margin="normal" value={name} onChange={e => setName(e.target.value)} required />
            <TextField label="Email" variant="outlined" fullWidth margin="normal" value={email} onChange={e => setEmail(e.target.value)} required />
            <TextField label="Password" type="password" variant="outlined" fullWidth margin="normal" value={password} onChange={e => setPassword(e.target.value)} required />
            <FormLabel component="legend" style={{ marginTop: '1rem' }}>Register as</FormLabel>
            <RadioGroup row value={role} onChange={e => setRole(e.target.value)}>
              <FormControlLabel value="PATIENT" control={<Radio color="primary" />} label="Patient" />
              <FormControlLabel value="DOCTOR" control={<Radio color="secondary" />} label="Doctor" />
            </RadioGroup>
            {error && <Typography color="error" style={{ marginTop: 8 }}>{error}</Typography>}
            <Button variant="contained" color="secondary" fullWidth className="auth-btn" type="submit" style={{ marginTop: 16 }} disabled={!name || !email || !password}>Sign Up</Button>
          </form>
          <Typography variant="body2" align="center" className="auth-link">
            Already have an account? <Link to="/login">Login</Link>
          </Typography>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default Signup;
