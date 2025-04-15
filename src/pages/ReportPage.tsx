import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Alert,
  AlertTitle,
  Breadcrumbs,
  Link,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { DisasterType, AlertSeverity } from '../models/types';
import { locationService } from '../services/locationService';
import { getDisasterTypeLabel } from '../utils/alertUtils';
import DisasterMap from '../components/DisasterMap';
import { SelectChangeEvent } from '@mui/material/Select';

interface FormData {
  title: string;
  type: DisasterType;
  description: string;
  location: {
    latitude: number;
    longitude: number;
    name: string;
  };
  contactInfo: string;
}

const ReportPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    type: DisasterType.EARTHQUAKE,
    description: '',
    location: {
      latitude: 0,
      longitude: 0,
      name: ''
    },
    contactInfo: ''
  });
  
  const [formErrors, setFormErrors] = useState({
    title: '',
    description: '',
    location: '',
    contactInfo: ''
  });
  
  // Get user's location on page load
  useEffect(() => {
    const getUserLocation = async () => {
      setLocationLoading(true);
      try {
        const location = await locationService.getUserLocation();
        
        // Use reverse geocoding to get location name (mocked for demo)
        const locationName = 'Current Location'; // In a real app, use a geocoding service
        
        setFormData(prev => ({
          ...prev,
          location: {
            latitude: location.coordinates.latitude,
            longitude: location.coordinates.longitude,
            name: locationName
          }
        }));
      } catch (err) {
        console.error('Error getting user location:', err);
        setError('Unable to get your location. Please enter it manually.');
      } finally {
        setLocationLoading(false);
      }
    };
    
    getUserLocation();
  }, []);
  
  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (!name) return;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (name in formErrors) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Handle location field changes
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [name]: name === 'name' ? value : parseFloat(value) || 0
      }
    }));
    
    setFormErrors(prev => ({
      ...prev,
      location: ''
    }));
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const errors = {
      title: '',
      description: '',
      location: '',
      contactInfo: ''
    };
    
    let isValid = true;
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
      isValid = false;
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
      isValid = false;
    } else if (formData.description.length < 20) {
      errors.description = 'Description should be at least 20 characters';
      isValid = false;
    }
    
    if (formData.location.latitude === 0 && formData.location.longitude === 0) {
      errors.location = 'Location is required';
      isValid = false;
    }
    
    if (activeStep === 1 && !formData.contactInfo.trim()) {
      errors.contactInfo = 'Contact information is required';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  // Handle next step
  const handleNext = () => {
    if (validateForm()) {
      setActiveStep(prev => prev + 1);
    }
  };
  
  // Handle back step
  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Mock API call to submit the report
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      setSuccess(true);
      
      // Clear form
      setFormData({
        title: '',
        type: DisasterType.EARTHQUAKE,
        description: '',
        location: {
          latitude: formData.location.latitude,
          longitude: formData.location.longitude,
          name: formData.location.name
        },
        contactInfo: ''
      });
      
      // Reset step
      setTimeout(() => {
        setActiveStep(0);
      }, 3000);
    } catch (err) {
      setError('Failed to submit your report. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Steps for the form
  const steps = ['Disaster Information', 'Additional Details', 'Review & Submit'];
  
  return (
    <Container maxWidth="md">
      <Box py={4}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link color="inherit" onClick={() => navigate('/')} sx={{ cursor: 'pointer' }}>
            Dashboard
          </Link>
          <Typography color="text.primary">Report Disaster</Typography>
        </Breadcrumbs>
        
        <Typography variant="h4" component="h1" gutterBottom>
          Report a Disaster
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Use this form to report a disaster in your area. Your report will be reviewed 
          and may help alert others nearby.
        </Typography>
        
        {/* Success message */}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            <AlertTitle>Report Submitted Successfully</AlertTitle>
            Thank you for your report. It will be reviewed and processed shortly.
          </Alert>
        )}
        
        {/* Error message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Paper sx={{ p: 3, mb: 3 }} elevation={3}>
          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Information */}
            {activeStep === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    name="title"
                    label="Event Title"
                    fullWidth
                    value={formData.title}
                    onChange={handleChange}
                    error={!!formErrors.title}
                    helperText={formErrors.title}
                    placeholder="E.g., Flooding on Main Street"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                      Disaster Type
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={(e) => {
                        const value = e.target.value as DisasterType;
                        setFormData(prev => ({
                          ...prev,
                          type: value
                        }));
                      }}
                      style={{ 
                        width: '100%', 
                        padding: '8px', 
                        borderRadius: '4px', 
                        border: '1px solid #ddd' 
                      }}
                    >
                      {Object.values(DisasterType).map((type) => (
                        <option key={type} value={type}>
                          {getDisasterTypeLabel(type)}
                        </option>
                      ))}
                    </select>
                  </div>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    name="description"
                    label="Description"
                    fullWidth
                    multiline
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    error={!!formErrors.description}
                    helperText={formErrors.description || 'Describe what you are seeing, including severity and any immediate dangers'}
                    placeholder="Describe the disaster in detail..."
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Location
                  </Typography>
                  
                  {locationLoading ? (
                    <Box display="flex" alignItems="center" mb={2}>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      <Typography variant="body2">Getting your location...</Typography>
                    </Box>
                  ) : (
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          name="name"
                          label="Location Name"
                          fullWidth
                          value={formData.location.name}
                          onChange={handleLocationChange}
                          placeholder="E.g., Downtown Miami"
                        />
                      </Grid>
                      
                      <Grid item xs={6}>
                        <TextField
                          name="latitude"
                          label="Latitude"
                          type="number"
                          fullWidth
                          value={formData.location.latitude}
                          onChange={handleLocationChange}
                          InputProps={{
                            inputProps: { step: 0.000001 }
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={6}>
                        <TextField
                          name="longitude"
                          label="Longitude"
                          type="number"
                          fullWidth
                          value={formData.location.longitude}
                          onChange={handleLocationChange}
                          InputProps={{
                            inputProps: { step: 0.000001 }
                          }}
                        />
                      </Grid>
                      
                      {formErrors.location && (
                        <Grid item xs={12}>
                          <FormHelperText error>{formErrors.location}</FormHelperText>
                        </Grid>
                      )}
                      
                      <Grid item xs={12}>
                        <Button
                          startIcon={<LocationOnIcon />}
                          onClick={async () => {
                            setLocationLoading(true);
                            try {
                              const location = await locationService.getUserLocation();
                              setFormData(prev => ({
                                ...prev,
                                location: {
                                  ...prev.location,
                                  latitude: location.coordinates.latitude,
                                  longitude: location.coordinates.longitude
                                }
                              }));
                            } catch (err) {
                              setError('Could not get your location');
                            } finally {
                              setLocationLoading(false);
                            }
                          }}
                          variant="outlined"
                          size="small"
                        >
                          Use My Current Location
                        </Button>
                      </Grid>
                    </Grid>
                  )}
                </Grid>
              </Grid>
            )}
            
            {/* Step 2: Additional Details */}
            {activeStep === 1 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    name="contactInfo"
                    label="Contact Information"
                    fullWidth
                    value={formData.contactInfo}
                    onChange={handleChange}
                    error={!!formErrors.contactInfo}
                    helperText={formErrors.contactInfo || 'Your email or phone number for verification'}
                    placeholder="email@example.com or phone number"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Disaster Location Preview
                  </Typography>
                  
                  <Box sx={{ height: '300px', mb: 2 }}>
                    <DisasterMap
                      alerts={[{
                        id: 'preview',
                        type: formData.type,
                        severity: AlertSeverity.MEDIUM,
                        title: formData.title,
                        description: formData.description,
                        location: {
                          name: formData.location.name || 'Reported Location',
                          coordinates: {
                            latitude: formData.location.latitude,
                            longitude: formData.location.longitude
                          }
                        },
                        safetyTips: [],
                        timestamp: new Date().toISOString(),
                        radius: 5,
                        active: true
                      }]}
                      height="250px"
                      zoom={10}
                    />
                  </Box>
                </Grid>
              </Grid>
            )}
            
            {/* Step 3: Review & Submit */}
            {activeStep === 2 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Review Your Report
                  </Typography>
                  
                  <Box component={Paper} variant="outlined" sx={{ p: 2, mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Title:</strong> {formData.title}
                    </Typography>
                    
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Disaster Type:</strong> {getDisasterTypeLabel(formData.type)}
                    </Typography>
                    
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Location:</strong> {formData.location.name || 'Unknown'} 
                      ({formData.location.latitude.toFixed(6)}, {formData.location.longitude.toFixed(6)})
                    </Typography>
                    
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Description:</strong>
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {formData.description}
                    </Typography>
                    
                    <Typography variant="subtitle1">
                      <strong>Contact Information:</strong> {formData.contactInfo}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    By submitting this report, you confirm that the information provided is accurate to the best of your knowledge.
                    False reports may have serious consequences.
                  </Typography>
                </Grid>
              </Grid>
            )}
            
            {/* Navigation buttons */}
            <Box mt={3} display="flex" justifyContent="space-between">
              <Button 
                onClick={activeStep === 0 ? () => navigate('/') : handleBack}
                disabled={loading}
              >
                {activeStep === 0 ? 'Cancel' : 'Back'}
              </Button>
              
              <Box>
                {activeStep === steps.length - 1 ? (
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<SendIcon />}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Submit Report'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                    disabled={loading}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default ReportPage; 