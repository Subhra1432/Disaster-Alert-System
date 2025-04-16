import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle, useMemo, useCallback } from 'react';
import { Paper, Typography, Box, Chip, Button, Alert } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WarningIcon from '@mui/icons-material/Warning';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { DisasterAlert, SafetyShelter, Coordinates, AlertSeverity } from '../models/types';
import { getSeverityColor, getDisasterIcon, getSeverityLabel } from '../utils/alertUtils';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { calculateDistance, getDistanceDescription } from '../utils/locationUtils';
import fixLeafletIcons from '../utils/leafletIconFix';

// Fix Leaflet icon issue with webpack/GitHub Pages
fixLeafletIcons();

// Custom component to control map view and get reference to the map
const MapController = forwardRef(({ 
  center, 
  zoom, 
  onMapReady 
}: { 
  center: [number, number], 
  zoom: number, 
  onMapReady: (map: L.Map) => void 
}, ref) => {
  const map = useMap();
  
  useImperativeHandle(ref, () => ({
    flyToLocation: (lat: number, lng: number, zoomLevel: number = 13) => {
      map.flyTo([lat, lng], zoomLevel, {
        animate: true,
        duration: 1.5
      });
    }
  }));
  
  // Set initial view and call onMapReady
  useEffect(() => {
    map.setView(center, zoom);
    onMapReady(map);
  }, [center, zoom, map, onMapReady]);
  
  return null;
});

// Component to handle current location and map center changing
const LocationMarker = ({ 
  userIcon, 
  alerts, 
  onProximityAlert,
  onLocationFound
}: { 
  userIcon: L.DivIcon; 
  alerts: DisasterAlert[];
  onProximityAlert: (nearbyAlerts: DisasterAlert[]) => void;
  onLocationFound?: (position: [number, number]) => void;
}) => {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const map = useMap();

  useEffect(() => {
    map.locate({ setView: true, maxZoom: 13 });
    
    const locationHandler = (e: L.LocationEvent) => {
      const newPosition: [number, number] = [e.latlng.lat, e.latlng.lng];
      setPosition(newPosition);
      setAccuracy(e.accuracy);
      
      map.flyTo(e.latlng, 13);
      
      if (onLocationFound) {
        onLocationFound(newPosition);
      }
      
      // Check if user is near any disaster
      if (alerts && alerts.length > 0) {
        const nearbyAlerts = alerts.filter(alert => {
          const distance = calculateDistance(
            newPosition[0], 
            newPosition[1], 
            alert.location.coordinates.latitude, 
            alert.location.coordinates.longitude
          );
          // Consider alerts within 50km as "nearby"
          return distance <= 50;
        });
        
        if (nearbyAlerts.length > 0) {
          onProximityAlert(nearbyAlerts);
        }
      }
    };

    map.on('locationfound', locationHandler);
    map.on('locationerror', (e) => {
      console.error('Error getting location:', e.message);
    });

    return () => {
      map.off('locationfound', locationHandler);
    };
  }, [map, alerts, onProximityAlert, onLocationFound]);

  return position === null ? null : (
    <>
      <Marker position={position} icon={userIcon}>
        <Popup>
          <strong>Your Current Location</strong>
          <br />
          Accuracy: {accuracy ? `±${Math.round(accuracy)} meters` : 'Unknown'}
        </Popup>
      </Marker>
      {accuracy && (
        <Circle 
          center={position}
          radius={accuracy}
          pathOptions={{ color: '#2196f3', fillColor: '#2196f3', fillOpacity: 0.1, weight: 1 }}
        />
      )}
    </>
  );
};

interface DisasterMapProps {
  alerts: DisasterAlert[];
  shelters?: SafetyShelter[];
  userLocation?: Coordinates;
  height?: string;
  width?: string;
  zoom?: number;
  onAlertClick?: (alertId: string) => void;
  selectedAlertId?: string | null;
}

const DisasterMap = forwardRef<any, DisasterMapProps>(({
  alerts: initialAlerts,
  shelters: initialShelters = [],
  userLocation,
  height = '400px',
  width = '100%',
  zoom = 2,
  onAlertClick,
  selectedAlertId
}, ref) => {
  const [showCurrentLocation, setShowCurrentLocation] = useState(true);
  const [nearbyAlerts, setNearbyAlerts] = useState<DisasterAlert[]>([]);
  const [showProximityWarning, setShowProximityWarning] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<[number, number] | null>(null);
  
  // Use useMemo to prevent unnecessary re-renders
  const alerts = useMemo(() => initialAlerts, [initialAlerts]);
  const shelters = useMemo(() => initialShelters, [initialShelters]);
  
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const mapControllerRef = useRef<any>(null);

  // Handle map ready callback - use useCallback to stabilize
  const handleMapReady = useCallback((map: L.Map) => {
    setMapInstance(map);
  }, []);

  // Expose methods via ref with useCallback
  useImperativeHandle(ref, () => ({
    flyToLocation: (lat: number, lng: number, zoomLevel?: number) => {
      if (mapControllerRef.current) {
        mapControllerRef.current.flyToLocation(lat, lng, zoomLevel);
      }
    }
  }), []);

  // Stabilize the mapCenter value with useMemo to prevent fluctuations
  const mapCenter: [number, number] = useMemo(() => {
    if (userLocation) {
      return [userLocation.latitude, userLocation.longitude];
    }
    if (alerts.length > 0) {
      // Try to find an Indian alert first for initial centering
      const indianAlert = alerts.find(a => 
        a.location.coordinates.latitude > 8 && 
        a.location.coordinates.latitude < 37 && 
        a.location.coordinates.longitude > 68 && 
        a.location.coordinates.longitude < 98
      );
      
      if (indianAlert) {
        return [indianAlert.location.coordinates.latitude, indianAlert.location.coordinates.longitude];
      }
      return [alerts[0].location.coordinates.latitude, alerts[0].location.coordinates.longitude];
    }
    return [20, 0]; // Default center at a global view
  }, [userLocation, alerts]);

  // Memoize the icons to prevent recreation
  const shelterIcon = useMemo(() => L.divIcon({
    className: 'custom-div-icon',
    html: '<div style="background-color: #4caf50; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white;"></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  }), []);
  
  const userIcon = useMemo(() => L.divIcon({
    className: 'custom-div-icon',
    html: '<div style="background-color: #2196f3; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 2px #2196f3;"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  }), []);

  const currentLocationIcon = useMemo(() => L.divIcon({
    className: 'custom-div-icon',
    html: '<div style="background-color: #4a148c; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 2px #4a148c;"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  }), []);

  // Stable handler for proximity alerts
  const handleProximityAlert = useCallback((alertsList: DisasterAlert[]) => {
    setNearbyAlerts(alertsList);
  }, []);

  // Stable handler for location found
  const handleLocationFound = useCallback((position: [number, number]) => {
    setCurrentPosition(position);
  }, []);

  useEffect(() => {
    if (nearbyAlerts.length > 0) {
      setShowProximityWarning(true);
      // Hide the warning after 10 seconds
      const timerId = setTimeout(() => {
        setShowProximityWarning(false);
      }, 10000);
      
      return () => clearTimeout(timerId);
    }
  }, [nearbyAlerts]);

  // Effect to focus on selected alert
  useEffect(() => {
    if (selectedAlertId && mapControllerRef.current) {
      const selectedAlert = alerts.find(alert => alert.id === selectedAlertId);
      if (selectedAlert) {
        mapControllerRef.current.flyToLocation(
          selectedAlert.location.coordinates.latitude,
          selectedAlert.location.coordinates.longitude,
          13
        );
      }
    }
  }, [selectedAlertId, alerts]);

  // Group alerts by severity for better visualization
  const criticalAlerts = alerts.filter(alert => alert.severity === AlertSeverity.CRITICAL);
  const highAlerts = alerts.filter(alert => alert.severity === AlertSeverity.HIGH);
  const mediumAlerts = alerts.filter(alert => alert.severity === AlertSeverity.MEDIUM);
  const lowAlerts = alerts.filter(alert => alert.severity === AlertSeverity.LOW);
  
  // Create custom marker icons based on severity
  const createAlertIcon = (severity: AlertSeverity, type: string) => {
    const color = getSeverityColor(severity).replace('#', '');
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: #${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; font-size: 10px;" title="${type}">${type.charAt(0)}</div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };
  
  // Memoize the MapContainer to prevent re-renders
  const MapContainerComponent = useMemo(() => (
    <MapContainer 
      key="map-container"
      center={mapCenter}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapController 
        ref={mapControllerRef}
        center={mapCenter}
        zoom={zoom}
        onMapReady={handleMapReady}
      />
      
      {showCurrentLocation && (
        <LocationMarker 
          userIcon={currentLocationIcon} 
          alerts={alerts}
          onProximityAlert={handleProximityAlert}
          onLocationFound={handleLocationFound}
        />
      )}
      
      {/* Stored user location */}
      {userLocation && (
        <>
          <Marker 
            position={[userLocation.latitude, userLocation.longitude] as [number, number]}
            icon={userIcon}
          >
            <Popup>
              <strong>Your Stored Location</strong>
            </Popup>
          </Marker>
          <Circle 
            center={[userLocation.latitude, userLocation.longitude] as [number, number]}
            radius={5000}
            pathOptions={{ color: '#2196f3', fillColor: '#2196f3', fillOpacity: 0.1, weight: 1 }}
          />
        </>
      )}
      
      {/* Disaster alerts */}
      {alerts.map(alert => {
        const isNearby = nearbyAlerts.some(nearbyAlert => nearbyAlert.id === alert.id);
        const isSelected = alert.id === selectedAlertId;
        
        // Calculate distance from current position
        let distance: number | null = null;
        let distanceText = '';
        if (currentPosition) {
          distance = calculateDistance(
            currentPosition[0],
            currentPosition[1],
            alert.location.coordinates.latitude,
            alert.location.coordinates.longitude
          );
          distanceText = getDistanceDescription(distance);
        }
        
        return (
          <Marker
            key={alert.id}
            position={[alert.location.coordinates.latitude, alert.location.coordinates.longitude] as [number, number]}
            icon={createAlertIcon(alert.severity, alert.type)}
            eventHandlers={{
              click: () => onAlertClick && onAlertClick(alert.id)
            }}
          >
            {/* Disaster name label */}
            {(isSelected || isNearby) && (
              <Tooltip permanent direction="top" offset={[0, -10]}>
                <span style={{ fontWeight: 'bold' }}>{alert.title}</span>
              </Tooltip>
            )}
            {(isNearby || isSelected) && (
              <Circle 
                center={[alert.location.coordinates.latitude, alert.location.coordinates.longitude] as [number, number]}
                radius={isSelected ? 10000 : 20000} // Highlight radius
                pathOptions={{ 
                  color: isSelected ? '#2196f3' : '#f44336', 
                  fillColor: isSelected ? '#2196f3' : '#f44336', 
                  fillOpacity: 0.2, 
                  weight: 2, 
                  dashArray: isSelected ? undefined : '5, 5' 
                }}
              />
            )}
            <Popup>
              <Box sx={{ p: 1 }}>
                <Typography variant="subtitle2">
                  {getDisasterIcon(alert.type)} {alert.title}
                  {isNearby && (
                    <Chip 
                      size="small" 
                      label="NEARBY" 
                      color="error" 
                      sx={{ ml: 1, height: 20, fontSize: '0.6rem' }} 
                    />
                  )}
                  {isSelected && (
                    <Chip 
                      size="small" 
                      label="SELECTED" 
                      color="primary" 
                      sx={{ ml: 1, height: 20, fontSize: '0.6rem' }} 
                    />
                  )}
                </Typography>
                <Chip
                  size="small"
                  label={getSeverityLabel(alert.severity)}
                  sx={{
                    bgcolor: getSeverityColor(alert.severity),
                    color: 'white',
                    fontSize: '0.7rem',
                    height: '20px',
                    my: 0.5
                  }}
                />
                <Typography variant="body2">{alert.description}</Typography>
                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <LocationOnIcon sx={{ fontSize: '0.8rem', mr: 0.5 }} />
                  <Typography variant="caption" color="text.secondary">
                    {alert.location.name}
                  </Typography>
                  {distance !== null && (
                    <span style={{ marginLeft: '5px', fontStyle: 'italic' }}>
                      ({distanceText})
                    </span>
                  )}
                </Typography>
              </Box>
            </Popup>
          </Marker>
        );
      })}
      
      {/* Shelters */}
      {shelters.map(shelter => {
        // Calculate distance from current position
        let distance: number | null = null;
        let distanceText = '';
        if (currentPosition) {
          distance = calculateDistance(
            currentPosition[0],
            currentPosition[1],
            shelter.coordinates.latitude,
            shelter.coordinates.longitude
          );
          distanceText = getDistanceDescription(distance);
        }
        
        return (
          <Marker
            key={shelter.id}
            position={[shelter.coordinates.latitude, shelter.coordinates.longitude] as [number, number]}
            icon={shelterIcon}
          >
            <Popup>
              <Box sx={{ p: 1 }}>
                <Typography variant="subtitle2">
                  {shelter.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Address:</strong> {shelter.address}
                </Typography>
                <Typography variant="body2">
                  <strong>Capacity:</strong> {shelter.capacity} people
                </Typography>
                <Chip
                  size="small"
                  label={shelter.available ? 'Open' : 'Full'}
                  color={shelter.available ? 'success' : 'error'}
                  sx={{ mt: 1, height: '20px' }}
                />
                {distance !== null && (
                  <Typography variant="caption" display="block" sx={{ mt: 1, fontStyle: 'italic' }}>
                    Distance: {distanceText}
                  </Typography>
                )}
              </Box>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  ), [
    mapCenter, 
    zoom, 
    mapInstance, 
    showCurrentLocation, 
    currentLocationIcon, 
    alerts, 
    handleProximityAlert, 
    handleLocationFound, 
    userLocation, 
    userIcon, 
    nearbyAlerts, 
    selectedAlertId, 
    currentPosition, 
    shelters, 
    shelterIcon,
    onAlertClick
  ]);

  return (
    <Paper 
      elevation={2}
      sx={{ 
        height, 
        width, 
        borderRadius: '12px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        backgroundColor: '#f5f5f5', 
        borderBottom: '1px solid #ddd',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
          <WarningIcon sx={{ mr: 1, color: 'primary.main' }} />
          Disaster Map
        </Typography>
        <Box>
          <Button
            startIcon={<MyLocationIcon />}
            size="small"
            variant="outlined"
            color="primary"
            onClick={() => setShowCurrentLocation(!showCurrentLocation)}
            sx={{ mr: 1 }}
          >
            {showCurrentLocation ? 'Hide My Location' : 'Show My Location'}
          </Button>
          <Chip 
            label={`${alerts.length} Alerts`} 
            size="small" 
            color="primary" 
            sx={{ mr: 1 }}
          />
          <Chip 
            label={`${shelters.length} Shelters`} 
            size="small" 
            variant="outlined"
          />
        </Box>
      </Box>

      {/* Proximity Warning Alert */}
      {showProximityWarning && nearbyAlerts.length > 0 && (
        <Alert 
          severity="warning" 
          variant="filled"
          onClose={() => setShowProximityWarning(false)}
          sx={{ 
            borderRadius: 0,
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': { opacity: 0.8 },
              '50%': { opacity: 1 },
              '100%': { opacity: 0.8 }
            }
          }}
        >
          <Typography variant="subtitle2">
            Warning: You are near {nearbyAlerts.length} disaster {nearbyAlerts.length === 1 ? 'zone' : 'zones'}!
          </Typography>
          <Typography variant="body2">
            {nearbyAlerts.map((alert, index) => (
              <span key={alert.id}>
                {getDisasterIcon(alert.type)} {alert.title}
                {index < nearbyAlerts.length - 1 ? ', ' : ''}
              </span>
            ))}
          </Typography>
        </Alert>
      )}
      
      {/* Map Content Area */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        overflow: 'hidden',
        backgroundColor: '#edf2f7'
      }}>
        {/* Alerts List */}
        <Box sx={{ 
          width: '30%', 
          borderRight: '1px solid #ddd',
          overflowY: 'auto',
          backgroundColor: 'white',
          p: 0
        }}>
          {nearbyAlerts.length > 0 && (
            <>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  bgcolor: '#f44336', 
                  color: 'white',
                  p: 1,
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': { backgroundColor: '#f44336' },
                    '50%': { backgroundColor: '#b71c1c' },
                    '100%': { backgroundColor: '#f44336' }
                  }
                }}
              >
                Nearby Alerts
              </Typography>
              {nearbyAlerts.map(alert => renderAlertItem(alert, onAlertClick, true))}
            </>
          )}

          {criticalAlerts.length > 0 && (
            <>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  bgcolor: getSeverityColor(AlertSeverity.CRITICAL), 
                  color: 'white',
                  p: 1
                }}
              >
                Critical Alerts
              </Typography>
              {criticalAlerts.map(alert => renderAlertItem(alert, onAlertClick, alert.id === selectedAlertId))}
            </>
          )}
          
          {highAlerts.length > 0 && (
            <>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  bgcolor: getSeverityColor(AlertSeverity.HIGH), 
                  color: 'white',
                  p: 1
                }}
              >
                High Priority
              </Typography>
              {highAlerts.map(alert => renderAlertItem(alert, onAlertClick, alert.id === selectedAlertId))}
            </>
          )}
          
          {mediumAlerts.length > 0 && (
            <>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  bgcolor: getSeverityColor(AlertSeverity.MEDIUM), 
                  color: 'white',
                  p: 1
                }}
              >
                Medium Priority
              </Typography>
              {mediumAlerts.map(alert => renderAlertItem(alert, onAlertClick, alert.id === selectedAlertId))}
            </>
          )}
          
          {lowAlerts.length > 0 && (
            <>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  bgcolor: getSeverityColor(AlertSeverity.LOW), 
                  color: 'white',
                  p: 1
                }}
              >
                Low Priority
              </Typography>
              {lowAlerts.map(alert => renderAlertItem(alert, onAlertClick, alert.id === selectedAlertId))}
            </>
          )}
          
          {alerts.length === 0 && (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No active alerts in this area
              </Typography>
            </Box>
          )}
        </Box>
        
        {/* Interactive Map */}
        <Box sx={{ flex: 1, position: 'relative' }}>
          {MapContainerComponent}
        </Box>
      </Box>
    </Paper>
  );
});

// Helper function to render alert items
const renderAlertItem = (alert: DisasterAlert, onAlertClick?: (id: string) => void, isNearby: boolean = false) => {
  const severityColor = getSeverityColor(alert.severity);
  const disasterIcon = getDisasterIcon(alert.type);
  
  return (
    <Box 
      key={alert.id}
      sx={{ 
        p: 1.5, 
        borderBottom: '1px solid #eee',
        cursor: onAlertClick ? 'pointer' : 'default',
        backgroundColor: isNearby ? 'rgba(244, 67, 54, 0.1)' : 'transparent',
        '&:hover': {
          backgroundColor: isNearby ? 'rgba(244, 67, 54, 0.2)' : '#f9f9f9'
        }
      }}
      onClick={() => onAlertClick && onAlertClick(alert.id)}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
        <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center' }}>
          <span role="img" aria-label="disaster icon" style={{ marginRight: '4px' }}>
            {disasterIcon}
          </span>
          {alert.title}
        </Typography>
        
        <Box>
          {isNearby && (
            <Chip 
              label="NEARBY" 
              size="small"
              sx={{ 
                height: '20px',
                fontSize: '0.6rem',
                backgroundColor: '#f44336',
                color: 'white',
                mr: 0.5
              }}
            />
          )}
          <Chip 
            label={getSeverityLabel(alert.severity)} 
            size="small"
            sx={{ 
              height: '20px',
              fontSize: '0.6rem',
              backgroundColor: severityColor,
              color: 'white'
            }}
          />
        </Box>
      </Box>
      
      <Box display="flex" alignItems="center">
        <LocationOnIcon sx={{ fontSize: '0.8rem', mr: 0.5, color: 'text.secondary' }} />
        <Typography variant="caption" color="text.secondary">
          {alert.location.name}
        </Typography>
      </Box>
    </Box>
  );
};

export default DisasterMap; 