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
  DirectionsRun as DirectionsIcon,
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
  const [databaseType, setDatabaseType] = useState<string>('real-api');
  const mapRef = useRef<any>(null);
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
      // Get the database service
      const dbService = getDatabaseServiceSync();
      console.log('Using database service:', getDatabaseType());
      
      // Update database type display
      setDatabaseType(getDatabaseType());
      
      // Get user location
      const location = await locationService.getUserLocation();
      setUserLocation(location);
      
      // Get all alerts
      console.log('Fetching real-time alerts...');
      const allAlerts = await dbService.getActiveAlerts();
      console.log(`Received ${allAlerts.length} real-time alerts`);
      if (allAlerts.length > 0) {
        console.log('First alert:', allAlerts[0]);
      }
      setAlerts(sortAlertsBySeverity(allAlerts));
      
      // Get alerts near user location
      const alertsNearby = await dbService.getAlertsNearLocation(
        location.coordinates.latitude,
        location.coordinates.longitude,
        200 // 200km radius
      );
      setNearbyAlerts(sortAlertsBySeverity(alertsNearby));
      
      // Get nearby shelters
      console.log('Fetching shelters...');
      const nearbyShelters = await dbService.getNearbyShelters(
        location.coordinates.latitude,
        location.coordinates.longitude,
        100 // 100km radius
      );
      console.log(`Received ${nearbyShelters.length} shelters`);
      if (nearbyShelters.length > 0) {
        console.log('First shelter:', nearbyShelters[0]);
      }
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
            Real-Time Disaster Alert System
          </Typography>
          <Box>
            <Tooltip title={`Database: ${databaseType}`}>
              <IconButton sx={{ mr: 1 }}>
                <StorageIcon color={databaseType === 'firebase' ? 'error' : 'info'} />
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
        
        {/* Database info */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <StorageIcon fontSize="small" sx={{ mr: 0.5, color: 'info.main' }} />
          <Typography variant="body2" color="text.secondary">
            Using real-time data from USGS Earthquake API and NASA EONET
          </Typography>
        </Box>
        
        {/* Add a badge for real-time data */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 2,
          p: 1,
          bgcolor: 'rgba(244, 67, 54, 0.1)',
          borderRadius: 1,
          border: '1px solid rgba(244, 67, 54, 0.3)'
        }}>
          <Chip 
            label="LIVE DATA" 
            color="error" 
            size="small" 
            sx={{ 
              fontWeight: 'bold',
              mr: 1,
              animation: 'pulse 2s infinite'
            }} 
          />
          <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'text.primary' }}>
            Displaying real earthquake and disaster data from USGS and NASA APIs
          </Typography>
        </Box>
        
        {/* Export button */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<FileDownloadIcon />}
            onClick={() => databaseExportService.exportToExcel(alerts, shelters)}
            size="small"
          >
            Export All Data to CSV Files
          </Button>
          <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
            (Exports alerts and shelters as separate CSV files for Excel)
          </Typography>
        </Box>
        
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
          ref={mapRef}
          alerts={alerts}
          shelters={shelters}
          userLocation={userLocation?.coordinates}
          height="400px"
          selectedAlertId={selectedAlertId}
          onAlertClick={handleAlertClick}
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
                <Typography sx={{ mr: 1 }}>Safety Shelters</Typography>
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
        
        {/* Tab Content */}
        <Box sx={{ p: 2 }}>
          {/* Nearby Alerts Tab */}
          {activeTab === 0 && (
            <>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
                Alerts Near You
                <Button
                  variant="outlined"
                  startIcon={<FileDownloadIcon />}
                  size="small"
                  onClick={() => databaseExportService.exportAlertsToCSV(nearbyAlerts)}
                  sx={{ ml: 'auto' }}
                >
                  Export to Excel
                </Button>
              </Typography>
              
              {nearbyAlerts.length === 0 ? (
                <Alert severity="info">
                  No alerts found near your current location. Stay safe!
                </Alert>
              ) : (
                <Grid container spacing={2}>
                  {nearbyAlerts.map(alert => (
                    <Grid item xs={12} md={6} key={alert.id}>
                      <Box 
                        onClick={() => handleAlertClick(alert.id)}
                        sx={{ 
                          cursor: 'pointer',
                          transform: selectedAlertId === alert.id ? 'scale(1.02)' : 'none',
                          boxShadow: selectedAlertId === alert.id ? '0 0 0 2px #2196f3' : 'none',
                          transition: 'all 0.2s ease-in-out',
                          borderRadius: '8px',
                        }}
                      >
                        <AlertCard alert={alert} />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}
          
          {/* All Alerts Tab */}
          {activeTab === 1 && (
            <>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <WarningIcon sx={{ mr: 1, color: 'primary.main' }} />
                All Active Alerts
                <Button
                  variant="outlined"
                  startIcon={<FileDownloadIcon />}
                  size="small"
                  onClick={() => databaseExportService.exportAlertsToCSV(alerts)}
                  sx={{ ml: 'auto' }}
                >
                  Export to Excel
                </Button>
              </Typography>
              
              {alerts.length === 0 ? (
                <Alert severity="info">
                  No active alerts at this time. Stay safe!
                </Alert>
              ) : (
                <Grid container spacing={2}>
                  {alerts.map(alert => (
                    <Grid item xs={12} md={6} key={alert.id}>
                      <Box 
                        onClick={() => handleAlertClick(alert.id)}
                        sx={{ 
                          cursor: 'pointer',
                          transform: selectedAlertId === alert.id ? 'scale(1.02)' : 'none',
                          boxShadow: selectedAlertId === alert.id ? '0 0 0 2px #2196f3' : 'none',
                          transition: 'all 0.2s ease-in-out',
                          borderRadius: '8px',
                        }}
                      >
                        <AlertCard alert={alert} />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}
          
          {/* Shelters Tab */}
          {activeTab === 2 && (
            <>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
                Available Safety Shelters
                <Button
                  variant="outlined"
                  startIcon={<FileDownloadIcon />}
                  size="small"
                  onClick={() => databaseExportService.exportSheltersToCSV(shelters)}
                  sx={{ ml: 'auto' }}
                >
                  Export to Excel
                </Button>
              </Typography>
              
              {shelters.length === 0 ? (
                <Alert severity="info">
                  No safety shelters found in your area.
                </Alert>
              ) : (
                <Grid container spacing={2}>
                  {shelters.map(shelter => (
                    <Grid item xs={12} md={6} lg={4} key={shelter.id}>
                      <ShelterCard shelter={shelter} />
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default HomePage; 