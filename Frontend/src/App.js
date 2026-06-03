import React, { useState, useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { getTheme } from './theme';
import ThemeToggle from './components/ThemeToggle';
import Header from './components/Header';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import ProfilePage from './pages/ProfilePage';
import AppointmentsPage from './pages/AppointmentsPage';
import BookAppointmentPage from './pages/BookAppointmentPage';
import DoctorsPage from './pages/DoctorsPage';
import MedicalHistoryPage from './pages/MedicalHistoryPage';
import EmergencyContactPage from './pages/EmergencyContactPage';
import DoctorProfilePage from './pages/DoctorProfilePage';
import DoctorDashboard from './pages/DoctorDashboard';
import AllPatientsPage from './pages/getallpatients';
import './App.css';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const theme = useMemo(() => getTheme(darkMode), [darkMode]);
  // Get user role from localStorage (set at login)
  const user = JSON.parse(localStorage.getItem('user'));
  const role = user?.role?.toUpperCase();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(135deg, rgb(147, 208, 251) 0%, #43cea2 100%)',
        animation: 'bgMove 10s ease-in-out infinite alternate',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: -1
      }} />
      <Header />
      {/* Theme toggle at bottom right */}
      <Box sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1200 }}>
        <ThemeToggle darkMode={darkMode} onToggle={() => setDarkMode((d) => !d)} />
      </Box>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={role === 'DOCTOR' ? <DoctorDashboard /> : <Home />} />
        <Route path="/profile" element={role === 'DOCTOR' ? <DoctorProfilePage /> : <ProfilePage />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/book-appointment" element={<BookAppointmentPage />} />
        <Route path="/doctors" element={<DoctorsPage />} />
        {/* Hide Medical History and Emergency Contact routes for doctors */}
        {role !== 'DOCTOR' && (
          <>
            <Route path="/medical-history" element={<MedicalHistoryPage />} />
            <Route path="/emergency-contact" element={<EmergencyContactPage />} />
          </>
        )}
        <Route path="/getallpatients" element={<AllPatientsPage />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
