import React, { useEffect, useState, useRef } from 'react';
import { DisasterAlert, UserLocation, SafetyShelter } from '../models/types';
import { locationService } from '../services/locationService';
import { sortAlertsBySeverity } from '../utils/alertUtils';
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
  useTheme,
  Fade,
  Divider
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  LocationOn as LocationIcon,
  Warning as WarningIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';

const HomePage: React.FC = () => {
  const theme = useTheme();
  const [alerts, setAlerts] = useState<DisasterAlert[]>([]);
  const [nearbyAlerts, setNearbyAlerts] = useState<DisasterAlert[]>([]);
  const [shelters, setShelters] = useState<SafetyShelter[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
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
        2000 // 2000km radius - increased to show global data
      );
      setNearbyAlerts(sortAlertsBySeverity(alertsNearby));
      
      // Get nearby shelters
      const nearbyShelters = await dbService.getNearbyShelters(
        location.coordinates.latitude,
        location.coordinates.longitude,
        2000 // 2000km radius - increased to show global data
      );
      setShelters(nearbyShelters);
    } catch (err) {
      setError('Failed to load disaster data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
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

  // Dashboard summary component
  const DashboardSummary = () => {
    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              height: '100%',
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)' 
                : 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Box 
              sx={{ 
                width: 60, 
                height: 60, 
                borderRadius: '50%', 
                backgroundColor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2
              }}
            >
              <WarningIcon sx={{ color: 'white', fontSize: 30 }} />
            </Box>
            <Typography variant="h4" align="center" fontWeight="bold">
              {alerts.length}
            </Typography>
            <Typography variant="subtitle1" align="center" color="text.secondary">
              Active Alerts
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              height: '100%',
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)' 
                : 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Box 
              sx={{ 
                width: 60, 
                height: 60, 
                borderRadius: '50%', 
                backgroundColor: 'error.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2
              }}
            >
              <LocationIcon sx={{ color: 'white', fontSize: 30 }} />
            </Box>
            <Typography variant="h4" align="center" fontWeight="bold">
              {nearbyAlerts.length}
            </Typography>
            <Typography variant="subtitle1" align="center" color="text.secondary">
              Nearby Alerts
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              height: '100%',
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)' 
                : 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Box 
              sx={{ 
                width: 60, 
                height: 60, 
                borderRadius: '50%', 
                backgroundColor: 'success.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2
              }}
            >
              <LocationIcon sx={{ color: 'white', fontSize: 30 }} />
            </Box>
            <Typography variant="h4" align="center" fontWeight="bold">
              {shelters.length}
            </Typography>
            <Typography variant="subtitle1" align="center" color="text.secondary">
              Safety Shelters
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    );
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
    <Fade in={!loading} timeout={800}>
      <Box sx={{ maxWidth: '1200px', margin: '0 auto', pb: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <DashboardIcon sx={{ mr: 1, color: 'primary.main', fontSize: 32 }} />
              <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                Dashboard
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={fetchAllData}
              sx={{ 
                borderRadius: '20px',
                px: 3,
                py: 1,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                background: theme.palette.mode === 'dark' ? 'linear-gradient(45deg, #d32f2f 30%, #f44336 90%)' : 'linear-gradient(45deg, #d32f2f 30%, #f44336 90%)'
              }}
            >
              Refresh Data
            </Button>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
              {error}
            </Alert>
          )}
        </Box>

        {/* Dashboard summary */}
        <DashboardSummary />
        
        {/* Map */}
        <Paper 
          elevation={0} 
          sx={{ 
            mb: 4, 
            height: '500px', 
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
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
        <Box sx={{ 
          borderBottom: 1, 
          borderColor: 'divider', 
          mb: 3,
          position: 'relative'
        }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            aria-label="disaster information tabs"
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
            sx={{
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0'
              },
              '& .MuiTab-root': {
                fontWeight: 600,
                fontSize: '0.9rem',
                textTransform: 'none',
                py: 2
              }
            }}
          >
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <WarningIcon fontSize="small" sx={{ mr: 1 }} />
                  All Alerts
                  <Chip 
                    label={alerts.length} 
                    size="small" 
                    sx={{ ml: 1, height: '20px', fontSize: '0.7rem', fontWeight: 'bold' }} 
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
                    sx={{ ml: 1, height: '20px', fontSize: '0.7rem', fontWeight: 'bold' }} 
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
                    sx={{ ml: 1, height: '20px', fontSize: '0.7rem', fontWeight: 'bold' }} 
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
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                Active Disaster Alerts
              </Typography>
              {alerts.length === 0 ? (
                <Alert severity="info" variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  No active alerts at this time.
                </Alert>
              ) : (
                <Grid container spacing={3}>
                  {alerts.map(alert => (
                    <Grid item xs={12} md={6} key={alert.id}>
                      <AlertCard 
                        alert={alert}
                        onClick={() => handleAlertClick(alert.id)}
                        showTypeLabel={true}
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
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                Alerts Near You
                {userLocation && (
                  <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 1, fontWeight: 'normal' }}>
                    ({userLocation.name})
                  </Typography>
                )}
              </Typography>
              {nearbyAlerts.length === 0 ? (
                <Alert severity="success" variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  No alerts reported in your area. You're in a safe location.
                </Alert>
              ) : (
                <Grid container spacing={3}>
                  {nearbyAlerts.map(alert => (
                    <Grid item xs={12} md={6} key={alert.id}>
                      <AlertCard 
                        alert={alert}
                        onClick={() => handleAlertClick(alert.id)}
                        showTypeLabel={true}
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
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                Safety Shelters
                {userLocation && (
                  <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 1, fontWeight: 'normal' }}>
                    (Near {userLocation.name})
                  </Typography>
                )}
              </Typography>
              {shelters.length === 0 ? (
                <Alert severity="info" variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  No shelters found in your area. Try expanding your search radius.
                </Alert>
              ) : (
                <Grid container spacing={3}>
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
    </Fade>
  );
};

export default HomePage; 