import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase/config';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

// Define food types and their corresponding units
const FOOD_TYPES = {
  'Rice': ['kg', 'g'],
  'Dal': ['kg', 'g'],
  'Roti': ['pieces', 'dozen'],
  'Sabzi': ['kg', 'g', 'portions'],
  'Other': ['kg', 'g', 'portions', 'pieces']
};

export default function HotelDashboard() {
  const { currentUser, userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [donations, setDonations] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Form state
  const [foodItem, setFoodItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [productionTime, setProductionTime] = useState('');
  const [expiryTime, setExpiryTime] = useState('');
  const [notes, setNotes] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [locationError, setLocationError] = useState('');

  // Update available units when food item changes
  useEffect(() => {
    if (foodItem) {
      const foodType = Object.keys(FOOD_TYPES).find(type => 
        foodItem.toLowerCase().includes(type.toLowerCase())
      ) || 'Other';
      setUnit(FOOD_TYPES[foodType][0]); // Set default unit
    }
  }, [foodItem]);

  const fetchDonations = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      const q = query(
        collection(db, 'donations'),
        where('hotelId', '==', currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const donationsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDonations(donationsList);
    } catch (error) {
      console.error('Error fetching donations:', error);
      setError('Failed to fetch your donations');
    } finally {
      setInitialLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchDonations();
    }
  }, [currentUser, fetchDonations]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Validate location
      if (!latitude || !longitude) {
        setLocationError('Please provide your location coordinates');
        setLoading(false);
        return;
      }

      const donationData = {
        foodItem,
        quantity: parseFloat(quantity),
        unit,
        productionTime: new Date(productionTime).toISOString(),
        expiryTime: new Date(expiryTime).toISOString(),
        notes,
        hotelId: currentUser.uid,
        hotelName: userData.businessName || 'Unknown Hotel',
        hotelAddress: address,
        location: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude)
        },
        status: 'available',
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'donations'), donationData);
      
      // Reset form
      setFoodItem('');
      setQuantity('');
      setUnit('');
      setProductionTime('');
      setExpiryTime('');
      setNotes('');
      setAddress('');
      setLatitude('');
      setLongitude('');
      setLocationError('');
      
      setSuccess(true);
      fetchDonations();
    } catch (error) {
      console.error('Error adding donation:', error);
      setError('Failed to add donation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Submit Food Donation
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Food donation submitted successfully!
              </Alert>
            )}
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                required
                fullWidth
                label="Food Item"
                value={foodItem}
                onChange={(e) => setFoodItem(e.target.value)}
                margin="normal"
                helperText="Enter the food item (e.g., Rice, Dal, Roti, Sabzi)"
              />
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <TextField
                    required
                    fullWidth
                    label="Quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={4}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Unit</InputLabel>
                    <Select
                      value={unit}
                      label="Unit"
                      onChange={(e) => setUnit(e.target.value)}
                    >
                      {foodItem && FOOD_TYPES[Object.keys(FOOD_TYPES).find(type => 
                        foodItem.toLowerCase().includes(type.toLowerCase())
                      ) || 'Other'].map((u) => (
                        <MenuItem key={u} value={u}>{u}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <TextField
                required
                fullWidth
                label="Production Time"
                type="datetime-local"
                value={productionTime}
                onChange={(e) => setProductionTime(e.target.value)}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                required
                fullWidth
                label="Expiry Time"
                type="datetime-local"
                value={expiryTime}
                onChange={(e) => setExpiryTime(e.target.value)}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                required
                fullWidth
                label="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                margin="normal"
                placeholder="Full address of your hotel"
              />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    required
                    fullWidth
                    label="Latitude"
                    type="number"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    margin="normal"
                    error={!!locationError}
                    helperText={locationError}
                    placeholder="e.g., 12.9716"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    required
                    fullWidth
                    label="Longitude"
                    type="number"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    margin="normal"
                    error={!!locationError}
                    placeholder="e.g., 77.5946"
                  />
                </Grid>
              </Grid>
              <TextField
                fullWidth
                label="Additional Notes"
                multiline
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                margin="normal"
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{ mt: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Submit Donation'}
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Your Recent Donations
            </Typography>
            {donations.length === 0 ? (
              <Typography color="textSecondary">
                No donations submitted yet.
              </Typography>
            ) : (
              donations.map((donation) => (
                <Paper
                  key={donation.id}
                  sx={{ p: 2, mb: 2, backgroundColor: 'background.default' }}
                >
                  <Typography variant="h6">{donation.foodItem}</Typography>
                  <Typography color="textSecondary">
                    Quantity: {donation.quantity} {donation.unit}
                  </Typography>
                  <Typography color="textSecondary">
                    Status: {donation.status}
                  </Typography>
                  <Typography color="textSecondary">
                    Created: {new Date(donation.createdAt).toLocaleString()}
                  </Typography>
                  
                  {/* Show request details if the donation has been requested */}
                  {donation.requestedBy && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                      <Typography variant="subtitle2" color="primary">
                        Request Details
                      </Typography>
                      <Typography variant="body2">
                        Requested by: {donation.requestedByOrg}
                      </Typography>
                      <Typography variant="body2">
                        Requested quantity: {donation.requestedQuantity} {donation.unit}
                      </Typography>
                      <Typography variant="body2">
                        Requested at: {new Date(donation.requestedAt).toLocaleString()}
                      </Typography>
                      {donation.requestNotes && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Notes: {donation.requestNotes}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Paper>
              ))
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
} 