# Frontend Documentation - Clinic Management System

## Overview
The Frontend is a React-based single-page application (SPA) that provides the user interface for the Clinic Management System. It offers role-based dashboards for patients and doctors with comprehensive functionality for appointment management, profile management, and medical records.

## Technology Stack
- **Framework**: React 18.2.0
- **UI Library**: Material-UI (MUI) 5.15.16
- **Routing**: React Router DOM 6.23.1
- **HTTP Client**: Axios 1.6.8
- **Animation**: Framer Motion 11.0.17
- **Build Tool**: Create React App
- **Styling**: CSS Modules, Material-UI Theme System

## Project Structure

### Directory Structure
```
Frontend/
├── public/                     # Static assets
│   ├── clinicbg.jpg           # Background image
│   ├── doctor-logo.png        # Doctor logo
│   ├── image.png              # General images
│   └── index.html             # HTML template
├── src/                       # Source code
│   ├── assets/                # Static assets (images, icons)
│   ├── components/            # Reusable components
│   │   ├── BackButton.js      # Navigation back button
│   │   ├── Header.js          # Application header
│   │   ├── LogoutButton.js    # Logout functionality
│   │   ├── ProtectedRoute.js  # Route protection
│   │   ├── ThemeToggle.js     # Dark/light mode toggle
│   │   └── UserProfileCard.js # User profile display
│   ├── pages/                 # Page components
│   │   ├── AppointmentsPage.js      # Appointment management
│   │   ├── Auth.css                 # Authentication styles
│   │   ├── BookAppointmentPage.js   # Appointment booking
│   │   ├── DoctorDashboard.js       # Doctor dashboard
│   │   ├── DoctorProfilePage.js     # Doctor profile management
│   │   ├── DoctorsPage.js           # Doctor listing
│   │   ├── EmergencyContactPage.js  # Emergency contact management
│   │   ├── getallpatients.js        # Patient listing (for doctors)
│   │   ├── Home.css                 # Home page styles
│   │   ├── Home.js                  # Patient dashboard
│   │   ├── Login.js                 # Login page
│   │   ├── MedicalHistoryPage.js    # Medical history management
│   │   ├── MedicalHistoryPage.module.css # Medical history styles
│   │   ├── ProfilePage.js           # Patient profile management
│   │   └── Signup.js                # User registration
│   ├── api.js                 # API service layer
│   ├── App.css                # Global application styles
│   ├── App.js                 # Main application component
│   ├── index.css              # Global CSS styles
│   ├── index.js               # Application entry point
│   └── theme.js               # Material-UI theme configuration
├── package.json               # Dependencies and scripts
└── package-lock.json          # Dependency lock file
```

## Core Components

### App.js - Main Application Component
```javascript
import React, { useState, useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { getTheme } from './theme';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const theme = useMemo(() => getTheme(darkMode), [darkMode]);
  const user = JSON.parse(localStorage.getItem('user'));
  const role = user?.role?.toUpperCase();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Background and theme setup */}
      <Header />
      <ThemeToggle darkMode={darkMode} onToggle={() => setDarkMode((d) => !d)} />
      <Routes>
        {/* Role-based routing */}
        <Route path="/home" element={role === 'DOCTOR' ? <DoctorDashboard /> : <Home />} />
        <Route path="/profile" element={role === 'DOCTOR' ? <DoctorProfilePage /> : <ProfilePage />} />
        {/* Conditional routes based on role */}
      </Routes>
    </ThemeProvider>
  );
}
```

### API Service Layer (api.js)
```javascript
import axios from 'axios';

const API_BASE = 'http://localhost:8080';

// User and Authentication APIs
export const getProfile = async () => axios.get(`${API_BASE}/api/users/me`);

// Appointment APIs
export const getAppointments = async () => axios.get(`${API_BASE}/api/appointments/me`);
export const bookAppointment = async (appointment) => axios.post(`${API_BASE}/api/appointments`, appointment);

// Doctor APIs
export const getDoctors = async () => axios.get(`${API_BASE}/api/doctors`);
export const getDoctorBySpecialty = async (specialty) => 
  axios.get(`${API_BASE}/api/doctors/specialty/${specialty}`);

// Patient APIs
export const getMedicalHistory = async () => 
  axios.get(`${API_BASE}/api/patients/me/medical-history`);
export const addMedicalHistory = async (description) => 
  axios.post(`${API_BASE}/api/patients/me/medical-history`, null, { params: { description } });

// Emergency Contact APIs
export const getEmergencyContact = async () => axios.get(`${API_BASE}/api/patients/me`);
export const updateEmergencyContact = async (name, number) => 
  axios.post(`${API_BASE}/api/patients/me/emergency-contact`, null, { params: { name, number } });
```

## Page Components

### Authentication Pages

#### Login.js
```javascript
import React, { useState } from 'react';
import { TextField, Button, Paper, Typography, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', credentials);
      const { token, user } = response.data;
      
      // Store authentication data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      navigate('/home');
    } catch (error) {
      setError('Invalid credentials');
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: 8 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Login
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <form onSubmit={handleLogin}>
        <TextField
          fullWidth
          label="Username"
          value={credentials.username}
          onChange={(e) => setCredentials({...credentials, username: e.target.value})}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          value={credentials.password}
          onChange={(e) => setCredentials({...credentials, password: e.target.value})}
          margin="normal"
          required
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Login
        </Button>
      </form>
    </Paper>
  );
};
```

#### Signup.js
```javascript
import React, { useState } from 'react';
import { TextField, Button, Paper, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import axios from 'axios';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'PATIENT'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      await axios.post('http://localhost:8080/api/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      alert('Registration successful! Please login.');
    } catch (error) {
      alert('Registration failed');
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 500, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Sign Up
      </Typography>
      <form onSubmit={handleSubmit}>
        {/* Form fields */}
      </form>
    </Paper>
  );
};
```

### Dashboard Pages

#### Home.js (Patient Dashboard)
```javascript
import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Button, Box } from '@mui/material';
import { motion } from 'framer-motion';
import { getAppointments, getMedicalHistory } from '../api';

const Home = () => {
  const [appointments, setAppointments] = useState([]);
  const [medicalHistory, setMedicalHistory] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [appointmentsRes, historyRes] = await Promise.all([
        getAppointments(),
        getMedicalHistory()
      ]);
      setAppointments(appointmentsRes.data);
      setMedicalHistory(historyRes.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h3" gutterBottom>
        Patient Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Quick Actions
                </Typography>
                <Button variant="contained" fullWidth sx={{ mb: 2 }}>
                  Book Appointment
                </Button>
                <Button variant="outlined" fullWidth>
                  View Medical History
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Recent Appointments */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Recent Appointments
              </Typography>
              {appointments.slice(0, 3).map((appointment) => (
                <Box key={appointment.id} sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                  <Typography variant="body1">
                    Dr. {appointment.doctorName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(appointment.appointmentTime).toLocaleDateString()}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
```

#### DoctorDashboard.js
```javascript
import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import axios from 'axios';

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    pendingAppointments: 0
  });

  useEffect(() => {
    loadDoctorData();
  }, []);

  const loadDoctorData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [appointmentsRes, patientsRes] = await Promise.all([
        axios.get('http://localhost:8080/api/appointments/me', config),
        axios.get('http://localhost:8080/api/patients/me/patients', config)
      ]);
      
      setAppointments(appointmentsRes.data);
      setPatients(patientsRes.data);
      
      // Calculate statistics
      const today = new Date().toDateString();
      const todayAppointments = appointmentsRes.data.filter(
        apt => new Date(apt.appointmentTime).toDateString() === today
      ).length;
      
      setStats({
        todayAppointments,
        totalPatients: patientsRes.data.length,
        pendingAppointments: appointmentsRes.data.filter(apt => apt.status === 'SCHEDULED').length
      });
    } catch (error) {
      console.error('Error loading doctor data:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h3" gutterBottom>
        Doctor Dashboard
      </Typography>
      
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
              <CardContent>
                <Typography variant="h4">{stats.todayAppointments}</Typography>
                <Typography variant="body1">Today's Appointments</Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h4">{stats.totalPatients}</Typography>
              <Typography variant="body1">Total Patients</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h4">{stats.pendingAppointments}</Typography>
              <Typography variant="body1">Pending Appointments</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Today's Appointments */}
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Today's Appointments
          </Typography>
          {appointments
            .filter(apt => new Date(apt.appointmentTime).toDateString() === new Date().toDateString())
            .map((appointment) => (
              <Box key={appointment.id} sx={{ mb: 2, p: 2, border: 1, borderColor: 'grey.300', borderRadius: 1 }}>
                <Typography variant="h6">{appointment.patientName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(appointment.appointmentTime).toLocaleTimeString()}
                </Typography>
                <Chip 
                  label={appointment.status} 
                  color={appointment.status === 'SCHEDULED' ? 'primary' : 'default'}
                  size="small"
                />
              </Box>
            ))}
        </CardContent>
      </Card>
    </Box>
  );
};
```

### Appointment Management

#### BookAppointmentPage.js
```javascript
import React, { useState, useEffect } from 'react';
import { 
  Paper, Typography, TextField, Button, FormControl, 
  InputLabel, Select, MenuItem, Grid, Alert 
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { getDoctors, bookAppointment } from '../api';

const BookAppointmentPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [appointmentTime, setAppointmentTime] = useState(null);
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const response = await getDoctors();
      setDoctors(response.data);
    } catch (error) {
      console.error('Error loading doctors:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await bookAppointment({
        doctorId: selectedDoctor,
        appointmentTime: appointmentTime.toISOString(),
        notes
      });
      setSuccess(true);
      setError('');
      // Reset form
      setSelectedDoctor('');
      setAppointmentTime(null);
      setNotes('');
    } catch (error) {
      setError('Failed to book appointment');
      setSuccess(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Book Appointment
      </Typography>
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Appointment booked successfully!
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Select Doctor</InputLabel>
              <Select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                required
              >
                {doctors.map((doctor) => (
                  <MenuItem key={doctor.userId} value={doctor.userId}>
                    Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialty}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Appointment Date & Time"
                value={appointmentTime}
                onChange={setAppointmentTime}
                renderInput={(params) => <TextField {...params} fullWidth required />}
                minDateTime={new Date()}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes (Optional)"
              multiline
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
            >
              Book Appointment
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};
```

## Theme Configuration

### theme.js
```javascript
import { createTheme } from '@mui/material/styles';

export const getTheme = (darkMode) => createTheme({
  palette: {
    mode: darkMode ? 'dark' : 'light',
    primary: {
      main: darkMode ? '#90caf9' : '#1976d2',
    },
    secondary: {
      main: darkMode ? '#f48fb1' : '#dc004e',
    },
    background: {
      default: darkMode ? '#121212' : '#f5f5f5',
      paper: darkMode ? '#1e1e1e' : '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});
```

## Routing and Navigation

### Protected Routes
```javascript
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default ProtectedRoute;
```

### Header Component
```javascript
import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import LogoutButton from './LogoutButton';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAuthenticated = !!localStorage.getItem('token');

  const navigationItems = [
    { label: 'Home', path: '/home' },
    { label: 'Profile', path: '/profile' },
    { label: 'Appointments', path: '/appointments' },
    { label: 'Doctors', path: '/doctors' },
  ];

  // Add role-specific navigation items
  if (user.role === 'PATIENT') {
    navigationItems.push(
      { label: 'Medical History', path: '/medical-history' },
      { label: 'Emergency Contact', path: '/emergency-contact' }
    );
  } else if (user.role === 'DOCTOR') {
    navigationItems.push(
      { label: 'All Patients', path: '/getallpatients' }
    );
  }

  return (
    <AppBar position="static" elevation={0}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Clinic Management System
        </Typography>
        
        {isAuthenticated && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            {navigationItems.map((item) => (
              <Button
                key={item.path}
                color="inherit"
                onClick={() => navigate(item.path)}
                sx={{
                  backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.1)' : 'transparent'
                }}
              >
                {item.label}
              </Button>
            ))}
            <LogoutButton />
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};
```

## State Management

### Authentication State
```javascript
// Authentication utilities
export const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// Initialize auth token on app start
const token = localStorage.getItem('token');
if (token) {
  setAuthToken(token);
}
```

### Local Storage Management
```javascript
// User data management
export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user') || '{}');
};

export const setCurrentUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const clearUserData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  delete axios.defaults.headers.common['Authorization'];
};
```

## Styling and UI

### Global Styles (index.css)
```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Animation classes */
.fade-in {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.slide-up {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```

### Component-Specific Styles
```css
/* Auth.css */
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.auth-paper {
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

/* Home.css */
.dashboard-card {
  transition: transform 0.2s ease-in-out;
}

.dashboard-card:hover {
  transform: translateY(-4px);
}

.quick-action-button {
  margin-bottom: 1rem;
  border-radius: 8px;
  font-weight: 600;
}
```

## Error Handling

### Global Error Handling
```javascript
// API error interceptor
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      clearUserData();
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Forbidden - show error message
      alert('Access denied');
    } else if (error.response?.status >= 500) {
      // Server error
      alert('Server error. Please try again later.');
    }
    return Promise.reject(error);
  }
);
```

### Component Error Boundaries
```javascript
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Something went wrong.</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Performance Optimization

### Code Splitting
```javascript
import { lazy, Suspense } from 'react';
import { CircularProgress, Box } from '@mui/material';

// Lazy load components
const DoctorDashboard = lazy(() => import('./pages/DoctorDashboard'));
const MedicalHistoryPage = lazy(() => import('./pages/MedicalHistoryPage'));

// Loading component
const LoadingSpinner = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
    <CircularProgress />
  </Box>
);

// Usage in App.js
<Suspense fallback={<LoadingSpinner />}>
  <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
</Suspense>
```

### Memoization
```javascript
import React, { memo, useMemo, useCallback } from 'react';

const AppointmentCard = memo(({ appointment, onStatusChange }) => {
  const formattedDate = useMemo(() => {
    return new Date(appointment.appointmentTime).toLocaleDateString();
  }, [appointment.appointmentTime]);

  const handleStatusChange = useCallback((newStatus) => {
    onStatusChange(appointment.id, newStatus);
  }, [appointment.id, onStatusChange]);

  return (
    <Card>
      {/* Card content */}
    </Card>
  );
});
```

## Testing

### Component Testing Setup
```javascript
// setupTests.js
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

configure({ testIdAttribute: 'data-testid' });

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;
```

### Example Component Test
```javascript
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import Login from '../pages/Login';
import { getTheme } from '../theme';

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={getTheme(false)}>
        {component}
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  test('renders login form', () => {
    renderWithProviders(<Login />);
    
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('handles form submission', async () => {
    renderWithProviders(<Login />);
    
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Add assertions for expected behavior
  });
});
```

## Build and Deployment

### Build Configuration
```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "build:prod": "REACT_APP_ENV=production npm run build",
    "analyze": "npm run build && npx bundle-analyzer build/static/js/*.js"
  }
}
```

### Environment Configuration
```javascript
// Environment variables
const config = {
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080',
  ENVIRONMENT: process.env.REACT_APP_ENV || 'development',
  VERSION: process.env.REACT_APP_VERSION || '1.0.0'
};

export default config;
```

### Docker Configuration
```dockerfile
# Multi-stage build
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Security Considerations

### Input Sanitization
```javascript
import DOMPurify from 'dompurify';

// Sanitize user input
const sanitizeInput = (input) => {
  return DOMPurify.sanitize(input);
};

// Usage in forms
const handleInputChange = (e) => {
  const sanitizedValue = sanitizeInput(e.target.value);
  setFormData({ ...formData, [e.target.name]: sanitizedValue });
};
```

### XSS Protection
```javascript
// Safe HTML rendering
const SafeHTML = ({ html }) => {
  const sanitizedHTML = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />;
};
```

## Accessibility

### ARIA Labels and Roles
```javascript
const AccessibleButton = ({ onClick, children, ariaLabel }) => (
  <Button
    onClick={onClick}
    aria-label={ariaLabel}
    role="button"
    tabIndex={0}
    onKeyPress={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        onClick();
      }
    }}
  >
    {children}
  </Button>
);
```

### Keyboard Navigation
```javascript
const KeyboardNavigableList = ({ items, onSelect }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1));
        break;
      case 'ArrowUp':
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        onSelect(items[selectedIndex]);
        break;
    }
  };

  return (
    <div onKeyDown={handleKeyDown} tabIndex={0}>
      {items.map((item, index) => (
        <div
          key={item.id}
          className={index === selectedIndex ? 'selected' : ''}
          role="option"
          aria-selected={index === selectedIndex}
        >
          {item.name}
        </div>
      ))}
    </div>
  );
};
```

## Future Enhancements

### Planned Features
- **Progressive Web App (PWA)**: Offline functionality and app-like experience
- **Real-time Notifications**: WebSocket integration for live updates
- **Advanced Search**: Enhanced search and filtering capabilities
- **Mobile Responsiveness**: Improved mobile user experience
- **Internationalization**: Multi-language support

### Technical Improvements
- **State Management**: Redux or Zustand for complex state management
- **Testing Coverage**: Comprehensive unit and integration tests
- **Performance Monitoring**: Real user monitoring and analytics
- **Accessibility Compliance**: WCAG 2.1 AA compliance
- **SEO Optimization**: Server-side rendering with Next.js

---

**Frontend Version**: 1.0.0
**Last Updated**: January 2025
**Maintainer**: Development Team