import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  TextField,
  Button,
  Typography,
  Box,
  Tabs,
  Tab,
  Alert,
  Grid,
  CircularProgress,
  Divider,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { AuthContainer, AuthPaper, Form } from '../../styles/authStyles';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [success, setSuccess] = useState(false);
  
  // Hotel/Caterer specific fields
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  
  // NGO/End User specific fields
  const [organizationName, setOrganizationName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [contactPerson, setContactPerson] = useState('');

  const { signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user came from login page with a specific tab
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const userType = searchParams.get('type');
    if (userType === 'ngo') {
      setTabValue(1);
    } else if (userType === 'hotel') {
      setTabValue(0);
    }
  }, [location]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  async function handleSubmit(e) {
    e.preventDefault();

    // Validate form fields
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (password.length < 6) {
      return setError('Password should be at least 6 characters');
    }

    if (tabValue === 0) {
      if (!businessName || !address || !phone) {
        return setError('Please fill in all required fields');
      }
    } else {
      if (!organizationName || !registrationNumber || !contactPerson) {
        return setError('Please fill in all required fields');
      }
    }

    try {
      setError('');
      setLoading(true);
      
      // Determine the user type based on the selected tab
      const userType = tabValue === 0 ? 'hotel' : 'ngo';
      
      const userData = userType === 'hotel'
        ? {
            businessName,
            address,
            phone,
            userType: 'hotel',
            createdAt: new Date().toISOString()
          }
        : {
            organizationName,
            registrationNumber,
            contactPerson,
            userType: 'ngo',
            createdAt: new Date().toISOString()
          };

      await signup(email, password, userType, userData);
      setSuccess(true);
      
      // Redirect to the appropriate dashboard after a short delay
      setTimeout(() => {
        navigate(`/${userType}/dashboard`);
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
      if (error.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please use a different email or login.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak. Please use a stronger password.');
      } else {
        setError('Failed to create an account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthContainer>
      <AuthPaper elevation={3}>
        <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
          Sign Up
        </Typography>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
          <Tabs value={tabValue} onChange={handleTabChange} centered>
            <Tab label="Hotels & Caterers" />
            <Tab label="NGOs & End Users" />
          </Tabs>
        </Box>
        {success && (
          <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
            Account created successfully! Redirecting to dashboard...
          </Alert>
        )}
        <TabPanel value={tabValue} index={0}>
          <Form onSubmit={handleSubmit}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Business Name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  helperText="Password must be at least 6 characters"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign Up'}
            </Button>
            <Divider sx={{ my: 2 }}>OR</Divider>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Already have an account?
              </Typography>
              <Button
                component={Link}
                to="/login?type=hotel"
                variant="outlined"
                fullWidth
                sx={{ mb: 1 }}
              >
                Sign In
              </Button>
            </Box>
          </Form>
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <Form onSubmit={handleSubmit}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Organization Name"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Registration Number"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Contact Person"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  helperText="Password must be at least 6 characters"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign Up'}
            </Button>
            <Divider sx={{ my: 2 }}>OR</Divider>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Already have an account?
              </Typography>
              <Button
                component={Link}
                to="/login?type=ngo"
                variant="outlined"
                fullWidth
                sx={{ mb: 1 }}
              >
                Sign In
              </Button>
            </Box>
          </Form>
        </TabPanel>
      </AuthPaper>
    </AuthContainer>
  );
} 