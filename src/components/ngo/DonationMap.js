import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Slider, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Button,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import MapComponent from '../common/MapComponent';

const DonationMap = () => {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [radius, setRadius] = useState(10); // km
  const [foodType, setFoodType] = useState('all');
  const [selectedDonation, setSelectedDonation] = useState(null);

  // Fetch available donations
  useEffect(() => {
    const fetchDonations = async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, 'donations'),
          where('status', '==', 'available')
        );
        const querySnapshot = await getDocs(q);
        const donationsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setDonations(donationsList);
        setFilteredDonations(donationsList);
      } catch (error) {
        console.error('Error fetching donations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

  // Filter donations based on radius and food type
  useEffect(() => {
    if (!donations.length || !userData?.location) return;

    const filtered = donations.filter(donation => {
      // Filter by food type
      if (foodType !== 'all' && donation.foodItem !== foodType) {
        return false;
      }

      // Filter by distance if user location is available
      if (userData.location && donation.location) {
        const distance = calculateDistance(
          userData.location.latitude,
          userData.location.longitude,
          donation.location.latitude,
          donation.location.longitude
        );
        return distance <= radius;
      }

      return true;
    });

    setFilteredDonations(filtered);
  }, [donations, radius, foodType, userData]);

  // Calculate distance between two points in km
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };

  // Get unique food types for filter
  const getFoodTypes = () => {
    const types = new Set(donations.map(d => d.foodItem));
    return ['all', ...Array.from(types)];
  };

  // Handle marker click
  const handleMarkerClick = (marker) => {
    setSelectedDonation(marker);
  };

  // Navigate to request page
  const handleRequestDonation = (donationId) => {
    navigate(`/ngo/request/${donationId}`);
  };

  // Convert donations to map markers
  const mapMarkers = filteredDonations.map(donation => ({
    position: {
      lat: donation.location?.latitude || 0,
      lng: donation.location?.longitude || 0
    },
    type: 'hotel',
    title: donation.foodItem,
    description: `Available until: ${new Date(donation.expiryTime).toLocaleString()}`,
    quantity: donation.quantity,
    address: donation.hotelAddress,
    id: donation.id
  }));

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Available Donations
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom>
            Search radius: {radius} km
          </Typography>
          <Slider
            value={radius}
            onChange={(e, newValue) => setRadius(newValue)}
            min={1}
            max={50}
            valueLabelDisplay="auto"
          />
          
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Food Type</InputLabel>
            <Select
              value={foodType}
              label="Food Type"
              onChange={(e) => setFoodType(e.target.value)}
            >
              {getFoodTypes().map((type) => (
                <MenuItem key={type} value={type}>
                  {type === 'all' ? 'All Food Types' : type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box sx={{ height: '500px', mb: 3 }}>
              <MapComponent 
                markers={mapMarkers}
                location={userData?.location}
                height="500px"
                onMarkerClick={handleMarkerClick}
              />
            </Box>
            
            {selectedDonation && (
              <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
                <Typography variant="h6">{selectedDonation.title}</Typography>
                <Typography color="textSecondary">
                  Quantity: {selectedDonation.quantity} portions
                </Typography>
                <Typography color="textSecondary">
                  {selectedDonation.description}
                </Typography>
                <Typography color="textSecondary">
                  Address: {selectedDonation.address}
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  sx={{ mt: 2 }}
                  onClick={() => handleRequestDonation(selectedDonation.id)}
                >
                  Request Donation
                </Button>
              </Paper>
            )}
            
            {filteredDonations.length === 0 && (
              <Typography color="textSecondary" align="center">
                No donations available within your search criteria.
              </Typography>
            )}
          </>
        )}
      </Paper>
    </Container>
  );
};

export default DonationMap; 