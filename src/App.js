import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import HotelDashboard from './components/hotel/HotelDashboard';
import NGODashboard from './components/ngo/NGODashboard';
import RequestDonation from './components/ngo/RequestDonation';
import ProtectedRoute from './components/ProtectedRoute';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/hotel/dashboard"
              element={
                <ProtectedRoute requiredUserType="hotel">
                  <HotelDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ngo/dashboard"
              element={
                <ProtectedRoute requiredUserType="ngo">
                  <NGODashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ngo/request/:donationId"
              element={
                <ProtectedRoute requiredUserType="ngo">
                  <RequestDonation />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
