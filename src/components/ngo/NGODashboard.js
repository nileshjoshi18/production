import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Alert,
  Box,
  CircularProgress,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Search as SearchIcon, LocationOn as LocationIcon, Map as MapIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import MapComponent from '../common/MapComponent';

export default function NGODashboard() {
  const { userData, currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [donations, setDonations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showMap, setShowMap] = useState(false);

  const fetchDonations = useCallback(async (lat, lng) => {
    setLoading(true);
    try {
      let q = query(
        collection(db, 'donations'),
        where('status', '==', 'available')
      );
      
      const querySnapshot = await getDocs(q);
      let donationsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // If we have location, sort by distance
      if (lat && lng) {
        donationsList = donationsList.map(donation => {
          return {
            ...donation,
            distance: calculateDistance(lat, lng, donation.latitude, donation.longitude)
          };
        }).sort((a, b) => a.distance - b.distance);
      }

      setDonations(donationsList);
    } catch (error) {
      console.error('Error fetching donations:', error);
      setError('Failed to fetch donations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchDonations(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          fetchDonations(); // Fetch without location
        }
      );
    } else {
      fetchDonations(); // Fetch without location
    }
  }, [fetchDonations]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    // Haversine formula to calculate distance between two points
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleRequestDonation = (donationId) => {
    navigate(`/ngo/request/${donationId}`);
  };

  const handleDonationClick = (donation) => {
    setSelectedDonation(donation);
    setShowMap(true);
  };

  const filteredDonations = donations.filter(donation =>
    donation.foodItem.toLowerCase().includes(searchTerm.toLowerCase()) ||
    donation.hotelName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5">
              NGO Dashboard
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<MapIcon />}
              onClick={() => navigate('/ngo/map')}
            >
              View Donations Map
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Available Food Donations
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by food item or hotel name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          </Paper>
        </Grid>

        {loading ? (
          <Grid item xs={12}>
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          </Grid>
        ) : (
          <Grid item xs={12}>
            <Grid container spacing={3}>
              {filteredDonations.map((donation) => (
                <Grid item xs={12} sm={6} md={4} key={donation.id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: 6
                      }
                    }}
                    onClick={() => handleDonationClick(donation)}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {donation.foodItem}
                      </Typography>
                      <Typography color="textSecondary" gutterBottom>
                        Quantity: {donation.quantity} portions
                      </Typography>
                      <Typography variant="body2">
                        From: {donation.hotelName}
                      </Typography>
                      <Typography variant="body2">
                        Address: {donation.hotelAddress}
                      </Typography>
                      <Typography variant="body2">
                        Production: {new Date(donation.productionTime).toLocaleString()}
                      </Typography>
                      <Typography variant="body2">
                        Expires: {new Date(donation.expiryTime).toLocaleString()}
                      </Typography>
                      {donation.notes && (
                        <Typography variant="body2" color="textSecondary">
                          Notes: {donation.notes}
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions>
                      <Button 
                        size="small" 
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRequestDonation(donation.id);
                        }}
                      >
                        Request Donation
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        )}

        {showMap && selectedDonation && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Location Map
              </Typography>
              <Box sx={{ height: 400, width: '100%' }}>
                <MapComponent
                  markers={[{
                    id: selectedDonation.id,
                    position: {
                      lat: selectedDonation.location.latitude,
                      lng: selectedDonation.location.longitude
                    },
                    title: selectedDonation.hotelName,
                    description: `${selectedDonation.foodItem} - ${selectedDonation.quantity} portions`
                  }]}
                  center={{
                    lat: selectedDonation.location.latitude,
                    lng: selectedDonation.location.longitude
                  }}
                  zoom={13}
                />
              </Box>
              <Button
                variant="outlined"
                onClick={() => setShowMap(false)}
                sx={{ mt: 2 }}
              >
                Close Map
              </Button>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
} 