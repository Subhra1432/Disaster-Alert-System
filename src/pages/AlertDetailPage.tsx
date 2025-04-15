import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Breadcrumbs,
  Link,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WarningIcon from '@mui/icons-material/Warning';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { DisasterAlert, SafetyShelter } from '../models/types';
import { locationService } from '../services/locationService';
import { getDatabaseServiceSync } from '../services/databaseManager';
import DisasterMap from '../components/DisasterMap';
import { 
  getSeverityColor, 
  getDisasterIcon, 
  formatAlertTime, 
  getSeverityLabel, 
  getDisasterTypeLabel 
} from '../utils/alertUtils';

const AlertDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [alert, setAlert] = useState<DisasterAlert | null>(null);
  const [nearbyShelters, setNearbyShelters] = useState<SafetyShelter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (!id) {
          throw new Error('Alert ID is missing');
        }
        
        // Get database service
        const dbService = getDatabaseServiceSync();
        
        // Get alert details
        const alertData = await dbService.getAlertById(id);
        
        if (!alertData) {
          throw new Error('Alert not found');
        }
        
        setAlert(alertData);
        
        // Get nearby shelters
        const location = alertData.location.coordinates;
        const shelters = await dbService.getNearbyShelters(
          location.latitude,
          location.longitude,
          50 // 50km radius
        );
        
        setNearbyShelters(shelters);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  if (loading) {
    return (
      <Container maxWidth="md">
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (error || !alert) {
    return (
      <Container maxWidth="md">
        <Box py={4}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || 'Alert not found'}
          </Alert>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/')}
            variant="contained"
          >
            Back to Dashboard
          </Button>
        </Box>
      </Container>
    );
  }
  
  const severityColor = getSeverityColor(alert.severity);
  const disasterIcon = getDisasterIcon(alert.type);
  
  return (
    <Container maxWidth="lg">
      <Box py={4}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link color="inherit" onClick={() => navigate('/')} sx={{ cursor: 'pointer' }}>
            Dashboard
          </Link>
          <Typography color="text.primary">Alert Details</Typography>
        </Breadcrumbs>
        
        {/* Back button */}
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/')}
          sx={{ mb: 3 }}
        >
          Back to Dashboard
        </Button>
        
        <Grid container spacing={3}>
          {/* Alert Header */}
          <Grid item xs={12}>
            <Paper 
              sx={{ 
                p: 3, 
                borderLeft: `5px solid ${severityColor}`,
                mb: 3
              }}
              elevation={3}
            >
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                    {disasterIcon} {alert.title}
                  </Typography>
                  
                  <Box display="flex" alignItems="center" mb={1}>
                    <LocationOnIcon sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body1">
                      {alert.location.name}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center">
                    <AccessTimeIcon sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body1">
                      {formatAlertTime(alert.timestamp)}
                    </Typography>
                  </Box>
                </Box>
                
                <Chip 
                  icon={<WarningIcon />}
                  label={getSeverityLabel(alert.severity)}
                  sx={{ 
                    bgcolor: severityColor,
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    py: 2,
                    px: 1
                  }}
                />
              </Box>
            </Paper>
          </Grid>
          
          {/* Alert Content and Map */}
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 3, mb: 3 }} elevation={3}>
              <Typography variant="h6" gutterBottom>
                About this {getDisasterTypeLabel(alert.type)}
              </Typography>
              <Typography variant="body1" paragraph>
                {alert.description}
              </Typography>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                Safety Instructions
              </Typography>
              <List>
                {alert.safetyTips.map((tip, index) => (
                  <ListItem key={index} disableGutters alignItems="flex-start">
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircleIcon sx={{ color: severityColor }} />
                    </ListItemIcon>
                    <ListItemText primary={tip} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={5}>
            {/* Map */}
            <Paper sx={{ p: 2, mb: 3 }} elevation={3}>
              <Typography variant="h6" gutterBottom>
                Affected Area
              </Typography>
              <Box sx={{ height: '300px' }}>
                <DisasterMap 
                  alerts={[alert]}
                  height="250px"
                  zoom={8}
                />
              </Box>
            </Paper>
            
            {/* Nearby Shelters */}
            <Paper sx={{ p: 2 }} elevation={3}>
              <Typography variant="h6" gutterBottom>
                Nearby Shelters
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {nearbyShelters.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No shelters found nearby.
                </Typography>
              ) : (
                <List dense>
                  {nearbyShelters.map((shelter) => (
                    <ListItem 
                      key={shelter.id} 
                      disableGutters
                      secondaryAction={
                        <Button 
                          variant="outlined" 
                          size="small"
                          href={`https://maps.google.com/?q=${shelter.coordinates.latitude},${shelter.coordinates.longitude}`}
                          target="_blank"
                        >
                          Directions
                        </Button>
                      }
                      sx={{ mb: 2 }}
                    >
                      <ListItemText 
                        primary={shelter.name} 
                        secondary={
                          <>
                            <Typography variant="body2" component="span" display="block">
                              {shelter.address}
                            </Typography>
                            <Typography variant="body2" component="span">
                              Capacity: {shelter.capacity} people
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default AlertDetailPage; 