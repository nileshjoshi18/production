import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Box,
  CircularProgress,
  Grid,
  Divider,
} from '@mui/material';
import { LocationOn as LocationIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function RequestDonation() {
  const { donationId } = useParams();
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [donation, setDonation] = useState(null);
  const [requestedQuantity, setRequestedQuantity] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchDonation = async () => {
      try {
        const donationRef = doc(db, 'donations', donationId);
        const donationDoc = await getDoc(donationRef);
        
        if (!donationDoc.exists()) {
          setError('Donation not found');
          return;
        }

        const donationData = donationDoc.data();
        if (donationData.status !== 'available') {
          setError('This donation is no longer available');
          return;
        }

        setDonation({
          id: donationDoc.id,
          ...donationData
        });
        setRequestedQuantity(donationData.quantity.toString());
      } catch (error) {
        console.error('Error fetching donation:', error);
        setError('Failed to load donation details');
      } finally {
        setLoading(false);
      }
    };

    fetchDonation();
  }, [donationId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Validate quantity
      const quantity = parseInt(requestedQuantity);
      if (isNaN(quantity) || quantity <= 0) {
        throw new Error('Please enter a valid quantity');
      }
      if (quantity > donation.quantity) {
        throw new Error('Requested quantity cannot exceed available quantity');
      }

      const donationRef = doc(db, 'donations', donationId);
      const updateData = {
        status: quantity === donation.quantity ? 'requested' : 'available',
        requestedBy: currentUser.uid,
        requestedByOrg: userData.organizationName,
        requestedQuantity: quantity,
        requestNotes: notes.trim(),
        requestedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        // If partial request, update the remaining quantity
        ...(quantity < donation.quantity && {
          quantity: donation.quantity - quantity
        })
      };

      await updateDoc(donationRef, updateData);
      setSuccess(
        quantity === donation.quantity
          ? 'Donation requested successfully! The hotel will be notified of your request.'
          : `Successfully requested ${quantity} portions. ${donation.quantity - quantity} portions remain available.`
      );
      
      // Redirect back to dashboard after a short delay
      setTimeout(() => {
        navigate('/ngo/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error requesting donation:', error);
      setError(error.message || 'Failed to request donation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button
          variant="contained"
          fullWidth
          onClick={() => navigate('/ngo/dashboard')}
        >
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Request Donation
        </Typography>
        
        {success ? (
          <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>
        ) : (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {donation.foodItem}
              </Typography>
              <Typography color="textSecondary">
                From: {donation.hotelName}
              </Typography>
              <Typography color="textSecondary">
                Available Quantity: {donation.quantity} portions
              </Typography>
              <Typography color="textSecondary">
                Expiry Time: {new Date(donation.expiryTime).toLocaleString()}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <LocationIcon fontSize="small" color="action" />
                <Typography variant="body2" color="textSecondary" component="span" sx={{ ml: 1 }}>
                  {donation.hotelAddress}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                required
                fullWidth
                label="Requested Quantity (portions)"
                type="number"
                value={requestedQuantity}
                onChange={(e) => setRequestedQuantity(e.target.value)}
                margin="normal"
                inputProps={{ min: 1, max: donation.quantity }}
              />
              
              <TextField
                fullWidth
                label="Additional Notes"
                multiline
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                margin="normal"
                placeholder="Any specific requirements or information for the hotel..."
              />

              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => navigate('/ngo/dashboard')}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={submitting}
                  >
                    {submitting ? <CircularProgress size={24} /> : 'Confirm Request'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
} 