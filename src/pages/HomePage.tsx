import React, { useEffect, useState } from 'react';
import { DisasterAlert, UserLocation, SafetyShelter } from '../models/types';
import { disasterService } from '../services/disasterApi';
import { locationService } from '../services/locationService';
import { notificationService } from '../services/notificationService';
import { sortAlertsBySeverity } from '../utils/alertUtils';
import AlertCard from '../components/AlertCard';
import DisasterMap from '../components/DisasterMap';
import ShelterCard from '../components/ShelterCard';
import { 
  Typography, 
  Box,
  Paper, 
  Button, 
  CircularProgress, 
  Tabs, 
  Tab, 
  Grid, 
  Chip,
  Alert, 
  Card, 
  CardContent, 
  CardActions,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import { 
  Refresh as RefreshIcon, 
  Notifications as NotificationsIcon, 
  NotificationsOff as NotificationsOffIcon,
  LocationOn as LocationIcon,
  DirectionsRun as DirectionsIcon
} from '@mui/icons-material';

const HomePage: React.FC = () => {
  const [alerts, setAlerts] = useState<DisasterAlert[]>([]);
  const [nearbyAlerts, setNearbyAlerts] = useState<DisasterAlert[]>([]);
  const [shelters, setShelters] = useState<SafetyShelter[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const theme = useTheme();
  
  // Get all relevant data on initial load
  useEffect(() => {
    fetchAllData();
  }, []);
  
  // Function to fetch all relevant data
  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get user location
      const location = await locationService.getUserLocation();
      setUserLocation(location);
      
      // Get all alerts
      const allAlerts = await disasterService.getActiveAlerts();
      setAlerts(sortAlertsBySeverity(allAlerts));
      
      // Get alerts near user location
      const alertsNearby = await disasterService.getAlertsNearLocation(
        location.coordinates.latitude,
        location.coordinates.longitude,
        200 // 200km radius
      );
      setNearbyAlerts(sortAlertsBySeverity(alertsNearby));
      
      // Get nearby shelters
      const nearbyShelters = await disasterService.getNearbyShelters(
        location.coordinates.latitude,
        location.coordinates.longitude,
        100 // 100km radius
      );
      setShelters(nearbyShelters);
      
      // Show notifications for nearby alerts
      if (notificationsEnabled) {
        alertsNearby.forEach(alert => {
          notificationService.showAlertNotification(alert);
        });
      }
    } catch (err) {
      setError('Failed to load disaster data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle notifications
  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      const granted = await notificationService.requestPermission();
      setNotificationsEnabled(granted);
      if (granted && nearbyAlerts.length > 0) {
        // Show notifications for current alerts
        nearbyAlerts.forEach(alert => {
          notificationService.showAlertNotification(alert);
        });
      }
    } else {
      setNotificationsEnabled(false);
    }
  };
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '80vh' 
        }}
      >
        <CircularProgress color="primary" size={50} sx={{ mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Loading disaster data...
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ maxWidth: '1200px', margin: '0 auto', pb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2 
        }}>
          <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
            Real-Time Disaster Alert System
          </Typography>
          <Box>
            <Tooltip title={notificationsEnabled ? "Disable notifications" : "Enable notifications"}>
              <IconButton 
                onClick={toggleNotifications}
                color={notificationsEnabled ? "primary" : "default"}
                sx={{ mr: 1 }}
              >
                {notificationsEnabled ? <NotificationsIcon /> : <NotificationsOffIcon />}
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={fetchAllData}
              disabled={loading}
              size="small"
            >
              Refresh
            </Button>
          </Box>
        </Box>
        
        {/* Location info */}
        {userLocation && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocationIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              Showing alerts based on your location: 
              approximately {userLocation.coordinates.latitude.toFixed(2)}, 
              {userLocation.coordinates.longitude.toFixed(2)}
            </Typography>
          </Box>
        )}
        
        {/* Error message */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
      </Box>
      
      {/* Map */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 2, 
          mb: 3, 
          borderRadius: 2,
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: 6
          }
        }}
      >
        <DisasterMap 
          alerts={alerts}
          shelters={shelters}
          userLocation={userLocation?.coordinates}
          height="400px"
        />
      </Paper>
      
      {/* Tabs */}
      <Paper elevation={2} sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          aria-label="disaster information tabs"
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography sx={{ mr: 1 }}>Nearby Alerts</Typography>
                <Chip 
                  label={nearbyAlerts.length} 
                  color="primary" 
                  size="small" 
                  sx={{ height: 20, fontSize: '0.75rem' }} 
                />
              </Box>
            } 
            id="tab-0" 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography sx={{ mr: 1 }}>All Alerts</Typography>
                <Chip 
                  label={alerts.length} 
                  color="primary" 
                  size="small" 
                  sx={{ height: 20, fontSize: '0.75rem' }} 
                />
              </Box>
            } 
            id="tab-1" 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography sx={{ mr: 1 }}>Shelters</Typography>
                <Chip 
                  label={shelters.length} 
                  color="primary" 
                  size="small" 
                  sx={{ height: 20, fontSize: '0.75rem' }} 
                />
              </Box>
            } 
            id="tab-2" 
          />
        </Tabs>
      </Paper>
      
      {/* Tab Content */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 2, 
          borderRadius: 2,
          bgcolor: 'background.paper',
          minHeight: '200px',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: 3
          }
        }}
      >
        {/* Nearby Alerts Tab */}
        <Box role="tabpanel" hidden={activeTab !== 0} id="tabpanel-0">
          {nearbyAlerts.length === 0 ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No alerts in your area. Stay safe!
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {nearbyAlerts.map(alert => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </Box>
          )}
        </Box>
        
        {/* All Alerts Tab */}
        <Box role="tabpanel" hidden={activeTab !== 1} id="tabpanel-1">
          {alerts.length === 0 ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No active alerts at this time.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {alerts.map(alert => (
                <AlertCard key={alert.id} alert={alert} compact />
              ))}
            </Box>
          )}
        </Box>
        
        {/* Shelters Tab */}
        <Box role="tabpanel" hidden={activeTab !== 2} id="tabpanel-2">
          {shelters.length === 0 ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No shelters found in your area.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {shelters.map(shelter => (
                <Grid item xs={12} sm={6} md={4} key={shelter.id}>
                  <ShelterCard shelter={shelter} />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default HomePage; 