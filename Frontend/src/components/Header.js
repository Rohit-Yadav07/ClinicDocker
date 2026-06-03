import React from 'react';
import { useLocation } from 'react-router-dom';
import LogoutButton from './LogoutButton';

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '8px 16px',
  background: 'rgba(255,255,255,0.85)',
  boxShadow: '0 2px 8px rgba(67,206,162,0.10)',
  position: 'relative',
  zIndex: 1201,
};

const logoStyle = {
  height: 32,
  width: 32,
  marginRight: 12,
};

const titleStyle = {
  fontWeight: 900,
  fontSize: 20,
  color: '#1976d2',
  letterSpacing: 1,
  fontFamily: 'Montserrat, Roboto, sans-serif',
};

const Header = () => {
  // Hide logout button on login and signup pages
  const location = useLocation();
  const hideLogout = location.pathname === '/login' || location.pathname === '/signup';
  return (
    <header style={headerStyle}>
      <img src="/image.png" alt="Doctor Logo" style={logoStyle} />
      <span style={titleStyle}>CheckInCare</span>
      <div style={{ flex: 1 }} />
      {!hideLogout && <LogoutButton />}
    </header>
  );
};

export default Header;
