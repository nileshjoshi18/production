import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  CircularProgress,
  Alert,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
} from '@mui/material';
import { LocationOn, AccessTime, Restaurant, Map as MapIcon } from '@mui/icons-material';

const NGODashboard = () => {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [requestQuantity, setRequestQuantity] = useState('');
  const [requestNotes, setRequestNotes] = useState('');

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const donationsRef = collection(db, 'donations');
      const q = query(donationsRef, where('status', '==', 'available'));
      const querySnapshot = await getDocs(q);
      const donationsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDonations(donationsData);
    } catch (error) {
      setError('Error fetching donations: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestDonation = (donation) => {
    setSelectedDonation(donation);
    setRequestQuantity('');
    setRequestNotes('');
    setRequestDialogOpen(true);
  };

  const handleRequestSubmit = async () => {
    if (!selectedDonation) return;

    const quantity = parseInt(requestQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    if (quantity > selectedDonation.quantity) {
      setError('Requested quantity cannot exceed available quantity');
      return;
    }

    try {
      const donationRef = doc(db, 'donations', selectedDonation.id);
      const updateData = {
        status: quantity === selectedDonation.quantity ? 'requested' : 'partially_requested',
        requestedBy: currentUser.uid,
        requestedAt: new Date().toISOString(),
        requestedQuantity: quantity,
        requestNotes: requestNotes,
        remainingQuantity: selectedDonation.quantity - quantity
      };

      await updateDoc(donationRef, updateData);
      setSuccess('Donation request submitted successfully');
      setRequestDialogOpen(false);
      fetchDonations();
    } catch (error) {
      setError('Error requesting donation: ' + error.message);
    }
  };

  // Function to open Google Maps
  const openGoogleMaps = (donation) => {
    if (!userData?.address) {
      setError('NGO address not found. Please update your profile with your address.');
      return;
    }

    const ngoAddress = encodeURIComponent(userData.address);
    let hotelLocation;

    if (donation.location && donation.location.latitude && donation.location.longitude) {
      // If we have coordinates, use them for precise location
      hotelLocation = `${donation.location.latitude},${donation.location.longitude}`;
    } else if (donation.hotelAddress) {
      // If we only have address, use that
      hotelLocation = encodeURIComponent(donation.hotelAddress);
    } else {
      setError('Hotel location not found');
      return;
    }

    // Open Google Maps with directions from NGO to hotel
    const url = `https://www.google.com/maps/dir/?api=1&origin=${ngoAddress}&destination=${hotelLocation}&travelmode=driving`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Available Donations
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {donations.map((donation) => (
          <Grid item xs={12} sm={6} md={4} key={donation.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {donation.foodItem}
                </Typography>
                <Box display="flex" alignItems="center" mb={1}>
                  <Restaurant sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    Quantity: {donation.quantity} {donation.unit}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" mb={1}>
                  <LocationOn sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    {donation.hotelAddress}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <AccessTime sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    Expires: {new Date(donation.expiryTime).toLocaleDateString()}
                  </Typography>
                </Box>
                {donation.notes && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {donation.notes}
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
                  <Button
                    variant="outlined"
                    startIcon={<MapIcon />}
                    onClick={() => openGoogleMaps(donation)}
                    sx={{ flex: 1 }}
                  >
                    See in GMaps
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleRequestDonation(donation)}
                    sx={{ flex: 1 }}
                  >
                    Request Donation
                  </Button>
                </Stack>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={requestDialogOpen} onClose={() => setRequestDialogOpen(false)}>
        <DialogTitle>Request Donation</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Quantity"
            type="number"
            fullWidth
            value={requestQuantity}
            onChange={(e) => setRequestQuantity(e.target.value)}
            helperText={`Available: ${selectedDonation?.quantity} ${selectedDonation?.unit}`}
          />
          <TextField
            margin="dense"
            label="Notes"
            multiline
            rows={4}
            fullWidth
            value={requestNotes}
            onChange={(e) => setRequestNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRequestDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRequestSubmit} variant="contained" color="primary">
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default NGODashboard; 