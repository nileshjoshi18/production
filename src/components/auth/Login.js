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
  Divider,
  CircularProgress,
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

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user came from register page with a specific tab
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
    if (!email || !password) {
      return setError('Please fill in all required fields');
    }
    
    try {
      setError('');
      setLoading(true);
      
      // Determine the expected user type based on the selected tab
      const expectedUserType = tabValue === 0 ? 'hotel' : 'ngo';
      
      await login(email, password, expectedUserType);
      // Navigate to the appropriate dashboard based on user type
      navigate(`/${expectedUserType}/dashboard`);
    } catch (error) {
      console.error('Login error:', error);
      if (error.message && error.message.includes('registered as a')) {
        setError(error.message);
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Please try again later');
      } else {
        setError('Failed to sign in. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthContainer>
      <AuthPaper elevation={3}>
        <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
          Sign In
        </Typography>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
          <Tabs value={tabValue} onChange={handleTabChange} centered>
            <Tab label="Hotels & Caterers" />
            <Tab label="NGOs & End Users" />
          </Tabs>
        </Box>
        <TabPanel value={tabValue} index={0}>
          <Form onSubmit={handleSubmit}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
            <Divider sx={{ my: 2 }}>OR</Divider>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Don't have an account?
              </Typography>
              <Button
                component={Link}
                to="/register?type=hotel"
                variant="outlined"
                fullWidth
                sx={{ mb: 1 }}
              >
                Register as Hotel/Caterer
              </Button>
            </Box>
          </Form>
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <Form onSubmit={handleSubmit}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
            <Divider sx={{ my: 2 }}>OR</Divider>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Don't have an account?
              </Typography>
              <Button
                component={Link}
                to="/register?type=ngo"
                variant="outlined"
                fullWidth
                sx={{ mb: 1 }}
              >
                Register as NGO/End User
              </Button>
            </Box>
          </Form>
        </TabPanel>
      </AuthPaper>
    </AuthContainer>
  );
} 