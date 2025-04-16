import React, { useEffect, useState, useRef } from 'react';
import { DisasterAlert, UserLocation, SafetyShelter } from '../models/types';
import { locationService } from '../services/locationService';
import { notificationService } from '../services/notificationService';
import { sortAlertsBySeverity } from '../utils/alertUtils';
import { databaseExportService } from '../utils/excelExport';
import AlertCard from '../components/AlertCard';
import DisasterMap from '../components/DisasterMap';
import ShelterCard from '../components/ShelterCard';
import { getDatabaseServiceSync, getDatabaseType } from '../services/databaseManager';
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
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Refresh as RefreshIcon, 
  Notifications as NotificationsIcon, 
  NotificationsOff as NotificationsOffIcon,
  LocationOn as LocationIcon,
  Warning as WarningIcon,
  Storage as StorageIcon,
  FileDownload as FileDownloadIcon
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
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [databaseType, setDatabaseType] = useState<string>('mock');
  const mapRef = useRef<any>(null);
  
  // Get all relevant data on initial load
  useEffect(() => {
    fetchAllData();
  }, []);
  
  // Function to fetch all relevant data
  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get the database service
      const dbService = getDatabaseServiceSync();
      
      // Update database type display
      setDatabaseType(getDatabaseType());
      
      // Get user location
      const location = await locationService.getUserLocation();
      setUserLocation(location);
      
      // Get all alerts
      const allAlerts = await dbService.getActiveAlerts();
      setAlerts(sortAlertsBySeverity(allAlerts));
      
      // Get alerts near user location
      const alertsNearby = await dbService.getAlertsNearLocation(
        location.coordinates.latitude,
        location.coordinates.longitude,
        200 // 200km radius
      );
      setNearbyAlerts(sortAlertsBySeverity(alertsNearby));
      
      // Get nearby shelters
      const nearbyShelters = await dbService.getNearbyShelters(
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
  
  // Handle alert click to focus map on that location
  const handleAlertClick = (alertId: string) => {
    setSelectedAlertId(alertId);
    
    // Find the alert by ID
    const alert = [...alerts, ...nearbyAlerts].find(a => a.id === alertId);
    if (alert && mapRef.current) {
      // If we have the alert and the map reference, tell the map to focus on this location
      mapRef.current.flyToLocation(alert.location.coordinates.latitude, alert.location.coordinates.longitude);
    }
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
            Disaster Alert System
          </Typography>
          <Box>
            <Tooltip title={`Using mock data`}>
              <IconButton sx={{ mr: 1 }}>
                <StorageIcon color="info" />
              </IconButton>
            </Tooltip>
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
              startIcon={<RefreshIcon />}
              onClick={fetchAllData}
              sx={{ mr: 1 }}
            >
              Refresh Data
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={() => databaseExportService.exportToExcel(alerts, shelters)}
            >
              Export
            </Button>
          </Box>
        </Box>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Stay informed about natural disasters and find nearby safety shelters. 
          Data is updated regularly to provide the most current information.
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            {error}
          </Alert>
        )}
      </Box>
      
      {/* Map */}
      <Paper 
        elevation={2} 
        sx={{ 
          mb: 4, 
          height: '500px', 
          borderRadius: '12px',
          overflow: 'hidden'
        }}
      >
        <DisasterMap 
          alerts={alerts}
          shelters={shelters}
          height="500px"
          width="100%"
          onAlertClick={handleAlertClick}
          selectedAlertId={selectedAlertId}
          ref={mapRef}
        />
      </Paper>
      
      {/* Tabs for Alerts, Nearby Alerts, and Shelters */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="disaster information tabs">
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <WarningIcon fontSize="small" sx={{ mr: 1 }} />
                All Alerts
                <Chip 
                  label={alerts.length} 
                  size="small" 
                  sx={{ ml: 1, height: '20px', fontSize: '0.7rem' }} 
                />
              </Box>
            } 
            id="tab-0" 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationIcon fontSize="small" sx={{ mr: 1 }} />
                Nearby Alerts
                <Chip 
                  label={nearbyAlerts.length} 
                  size="small" 
                  color="error"
                  sx={{ ml: 1, height: '20px', fontSize: '0.7rem' }} 
                />
              </Box>
            } 
            id="tab-1" 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationIcon fontSize="small" sx={{ mr: 1 }} />
                Shelters
                <Chip 
                  label={shelters.length} 
                  size="small" 
                  color="success"
                  sx={{ ml: 1, height: '20px', fontSize: '0.7rem' }} 
                />
              </Box>
            } 
            id="tab-2" 
          />
        </Tabs>
      </Box>
      
      {/* Content based on selected tab */}
      <Box sx={{ mb: 4 }}>
        {/* All Alerts Tab */}
        {activeTab === 0 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Active Disaster Alerts
            </Typography>
            {alerts.length === 0 ? (
              <Alert severity="info">No active alerts at this time.</Alert>
            ) : (
              <Grid container spacing={2}>
                {alerts.map(alert => (
                  <Grid item xs={12} md={6} key={alert.id}>
                    <AlertCard 
                      alert={alert}
                      onClick={() => handleAlertClick(alert.id)}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}
        
        {/* Nearby Alerts Tab */}
        {activeTab === 1 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Alerts Near You
              {userLocation && (
                <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 1 }}>
                  ({userLocation.name})
                </Typography>
              )}
            </Typography>
            {nearbyAlerts.length === 0 ? (
              <Alert severity="success">
                No alerts reported in your area. You're in a safe location.
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {nearbyAlerts.map(alert => (
                  <Grid item xs={12} md={6} key={alert.id}>
                    <AlertCard 
                      alert={alert}
                      onClick={() => handleAlertClick(alert.id)}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}
        
        {/* Shelters Tab */}
        {activeTab === 2 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Safety Shelters
              {userLocation && (
                <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 1 }}>
                  (Near {userLocation.name})
                </Typography>
              )}
            </Typography>
            {shelters.length === 0 ? (
              <Alert severity="info">
                No shelters found in your area. Try expanding your search radius.
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {shelters.map(shelter => (
                  <Grid item xs={12} md={6} key={shelter.id}>
                    <ShelterCard
                      shelter={shelter}
                      userLocation={userLocation ? userLocation.coordinates : undefined}
                      onClick={() => {
                        if (mapRef.current) {
                          mapRef.current.flyToLocation(
                            shelter.coordinates.latitude,
                            shelter.coordinates.longitude
                          );
                        }
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default HomePage; 