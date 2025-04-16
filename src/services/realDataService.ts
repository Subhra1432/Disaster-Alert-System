import { DisasterAlert, SafetyShelter, DisasterType, AlertSeverity } from '../models/types';

/**
 * Real Data Service for Disaster Alert System
 * 
 * This service fetches real disaster data from public APIs
 * instead of using the mock database.
 */

// USGS Earthquake API
const USGS_EARTHQUAKE_API = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson';

// NASA EONET API for wildfires, floods, etc.
const NASA_EONET_API = 'https://eonet.gsfc.nasa.gov/api/v3/events';

/**
 * Convert USGS earthquake data to our DisasterAlert format
 */
const convertUSGSEarthquakeToAlert = (earthquake: any): DisasterAlert => {
  // Determine severity based on magnitude
  let severity = AlertSeverity.LOW;
  const magnitude = earthquake.properties.mag;
  
  if (magnitude >= 7.0) {
    severity = AlertSeverity.CRITICAL;
  } else if (magnitude >= 6.0) {
    severity = AlertSeverity.HIGH;
  } else if (magnitude >= 5.0) {
    severity = AlertSeverity.MEDIUM;
  }
  
  // Extract location name
  const locationParts = earthquake.properties.place.split(' of ');
  const locationName = locationParts.length > 1 ? locationParts[1] : locationParts[0];
  
  // Create safety tips based on severity
  const safetyTips = [
    'Drop, cover, and hold on',
    'Stay away from windows and exterior walls',
    'If outside, stay in open areas away from buildings',
    'Be prepared for aftershocks'
  ];
  
  if (severity === AlertSeverity.HIGH || severity === AlertSeverity.CRITICAL) {
    safetyTips.push('Expect and prepare for potential infrastructure damage');
    safetyTips.push('Check gas, water, and electric lines for damage');
  }
  
  return {
    id: earthquake.id,
    type: DisasterType.EARTHQUAKE,
    severity,
    title: `M${magnitude.toFixed(1)} - ${locationName}`,
    description: `${magnitude.toFixed(1)} magnitude earthquake ${earthquake.properties.place}. Depth: ${(earthquake.geometry.coordinates[2]).toFixed(1)}km.`,
    location: {
      name: locationName,
      coordinates: {
        latitude: earthquake.geometry.coordinates[1],
        longitude: earthquake.geometry.coordinates[0]
      }
    },
    safetyTips,
    timestamp: new Date(earthquake.properties.time).toISOString().split('T')[0] + 'T00:00:00.000Z',
    radius: Math.ceil(magnitude * 10), // Simple approximation of affected radius in km
    active: true
  };
};

/**
 * Convert NASA EONET event to our DisasterAlert format
 */
const convertEONETEventToAlert = (event: any): DisasterAlert | null => {
  // Skip closed events
  if (event.closed !== null) {
    return null;
  }
  
  // Determine disaster type based on category
  let type: DisasterType;
  switch (event.categories[0].id) {
    case 'wildfires':
      type = DisasterType.WILDFIRE;
      break;
    case 'severeStorms':
    case 'floods':
      type = DisasterType.FLOOD;
      break;
    case 'volcanoes':
      // Skip volcanoes as they're not in our DisasterType enum
      return null;
    default:
      // Skip other event types we don't support
      return null;
  }
  
  // Get the most recent geometry
  const latestGeometry = event.geometry[event.geometry.length - 1];
  if (!latestGeometry) return null;
  
  // Determine safety tips based on type
  let safetyTips: string[] = [];
  let severity = AlertSeverity.MEDIUM;
  
  if (type === DisasterType.WILDFIRE) {
    severity = AlertSeverity.HIGH;
    safetyTips = [
      'Follow evacuation orders immediately',
      'Pack emergency supplies and important documents',
      'Close all windows and doors before leaving',
      'Monitor local news for updates'
    ];
  } else if (type === DisasterType.FLOOD) {
    severity = AlertSeverity.MEDIUM;
    safetyTips = [
      'Move to higher ground immediately',
      'Do not walk or drive through flood waters',
      'Stay away from storm drains and culverts',
      'Follow evacuation orders if given'
    ];
  }
  
  return {
    id: event.id,
    type,
    severity,
    title: event.title,
    description: `${event.title}. Identified by ${event.sources.map((s: any) => s.id).join(', ')}.`,
    location: {
      name: event.title,
      coordinates: {
        latitude: latestGeometry.coordinates[1],
        longitude: latestGeometry.coordinates[0]
      }
    },
    safetyTips,
    timestamp: new Date(latestGeometry.date).toISOString().split('T')[0] + 'T00:00:00.000Z',
    radius: 50, // Default radius
    active: true
  };
};

/**
 * Fetch real earthquake data from USGS
 */
const fetchEarthquakes = async (): Promise<DisasterAlert[]> => {
  try {
    console.log('%c🔴 LIVE DATA: Fetching real earthquake data from USGS API...' + new Date().toLocaleTimeString(), 'background: #222; color: #bada55; font-size: 14px;');
    const response = await fetch(USGS_EARTHQUAKE_API);
    const data = await response.json();
    
    console.log(`%c🔴 LIVE DATA: Successfully received data from USGS API. Found ${data.features.length} earthquakes. [${new Date().toLocaleTimeString()}]`, 'background: #222; color: #bada55; font-size: 14px;');
    
    // Print just the first earthquake data if available
    if (data.features && data.features.length > 0) {
      const sample = data.features[0];
      console.log('%c🔴 SAMPLE EARTHQUAKE:', 'background: #222; color: #bada55; font-size: 14px;', {
        id: sample.id,
        place: sample.properties.place,
        magnitude: sample.properties.mag,
        time: new Date(sample.properties.time).toLocaleString(),
        coordinates: {
          latitude: sample.geometry.coordinates[1],
          longitude: sample.geometry.coordinates[0]
        }
      });
    }
    
    return data.features
      .map(convertUSGSEarthquakeToAlert)
      .filter((alert: DisasterAlert) => alert !== null);
  } catch (error) {
    console.error('Error fetching earthquake data:', error);
    return [];
  }
};

/**
 * Fetch other disaster events from NASA EONET
 */
const fetchOtherDisasters = async (): Promise<DisasterAlert[]> => {
  try {
    console.log('%c🔵 LIVE DATA: Fetching real disaster data from NASA EONET API...' + new Date().toLocaleTimeString(), 'background: #222; color: #00bfff; font-size: 14px;');
    const response = await fetch(`${NASA_EONET_API}?status=open`);
    const data = await response.json();
    
    console.log(`%c🔵 LIVE DATA: Successfully received data from NASA EONET API. Found ${data.events.length} events. [${new Date().toLocaleTimeString()}]`, 'background: #222; color: #00bfff; font-size: 14px;');
    
    // Print sample disaster data if available
    if (data.events && data.events.length > 0) {
      const sample = data.events[0];
      console.log('%c🔵 SAMPLE DISASTER:', 'background: #222; color: #00bfff; font-size: 14px;', {
        id: sample.id,
        title: sample.title,
        type: sample.categories[0].title,
        location: sample.geometry && sample.geometry.length > 0 ? 
          {
            latitude: sample.geometry[0].coordinates[1],
            longitude: sample.geometry[0].coordinates[0]
          } : 'No coordinates'
      });
    }
    
    return data.events
      .map(convertEONETEventToAlert)
      .filter((alert: DisasterAlert | null) => alert !== null) as DisasterAlert[];
  } catch (error) {
    console.error('Error fetching EONET disaster data:', error);
    return [];
  }
};

/**
 * Generate shelter data near disaster locations
 * Since we don't have a real API for shelters, we'll generate some based on the disaster locations
 */
const generateShelters = (alerts: DisasterAlert[]): SafetyShelter[] => {
  const shelters: SafetyShelter[] = [];
  let idCounter = 1;
  
  // Generate 1-2 shelters near each disaster location
  alerts.forEach(alert => {
    // Number of shelters to generate for this alert
    const shelterCount = Math.floor(Math.random() * 2) + 1;
    
    for (let i = 0; i < shelterCount; i++) {
      // Generate a shelter within 20-50km of the disaster
      const distance = (Math.random() * 30) + 20; // 20-50km
      const bearing = Math.random() * 360; // Random direction
      
      // Calculate new coordinates based on distance and bearing
      // This is a simple approximation using degrees (not accurate near poles or over long distances)
      const lat1 = alert.location.coordinates.latitude * Math.PI / 180;
      const lon1 = alert.location.coordinates.longitude * Math.PI / 180;
      const bearingRad = bearing * Math.PI / 180;
      
      // Earth radius in km
      const R = 6371;
      const distRatio = distance / R;
      
      const lat2 = Math.asin(Math.sin(lat1) * Math.cos(distRatio) + Math.cos(lat1) * Math.sin(distRatio) * Math.cos(bearingRad));
      const lon2 = lon1 + Math.atan2(
        Math.sin(bearingRad) * Math.sin(distRatio) * Math.cos(lat1),
        Math.cos(distRatio) - Math.sin(lat1) * Math.sin(lat2)
      );
      
      const latDeg = lat2 * 180 / Math.PI;
      const lonDeg = lon2 * 180 / Math.PI;
      
      // Shelter capacity based on disaster type
      let capacity = 200;
      if (alert.type === DisasterType.EARTHQUAKE) {
        capacity = 500;
      } else if (alert.type === DisasterType.WILDFIRE) {
        capacity = 300;
      }
      
      // Create a shelter name based on location
      const shelterName = `Emergency Shelter ${i + 1} near ${alert.location.name}`;
      
      shelters.push({
        id: (idCounter++).toString(),
        name: shelterName,
        coordinates: {
          latitude: latDeg,
          longitude: lonDeg
        },
        address: `Near ${alert.location.name}`,
        capacity,
        available: true
      });
    }
  });
  
  return shelters;
};

/**
 * Get all active disaster alerts from real data sources
 */
const getActiveAlerts = async (): Promise<DisasterAlert[]> => {
  // Fetch data from multiple APIs in parallel
  const [earthquakes, otherDisasters] = await Promise.all([
    fetchEarthquakes(),
    fetchOtherDisasters()
  ]);
  
  // Combine all disaster data
  return [...earthquakes, ...otherDisasters];
};

/**
 * Get alerts near a specific location
 */
const getAlertsNearLocation = async (
  latitude: number,
  longitude: number,
  radiusKm: number = 500
): Promise<DisasterAlert[]> => {
  // Fetch all alerts
  const allAlerts = await getActiveAlerts();
  
  // Filter alerts by distance
  return allAlerts.filter(alert => {
    // Calculate distance using Haversine formula
    const lat1 = latitude * Math.PI / 180;
    const lon1 = longitude * Math.PI / 180;
    const lat2 = alert.location.coordinates.latitude * Math.PI / 180;
    const lon2 = alert.location.coordinates.longitude * Math.PI / 180;
    
    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = 6371 * c; // Earth radius in km
    
    return distance <= radiusKm;
  });
};

/**
 * Get safety shelters near a location
 */
const getNearbyShelters = async (
  latitude: number,
  longitude: number,
  radiusKm: number = 100
): Promise<SafetyShelter[]> => {
  // First get nearby alerts
  const nearbyAlerts = await getAlertsNearLocation(latitude, longitude, radiusKm * 2);
  
  // Generate shelters based on these alerts
  const allShelters = generateShelters(nearbyAlerts);
  
  // Filter shelters by distance to requested location
  return allShelters.filter(shelter => {
    // Calculate distance using Haversine formula
    const lat1 = latitude * Math.PI / 180;
    const lon1 = longitude * Math.PI / 180;
    const lat2 = shelter.coordinates.latitude * Math.PI / 180;
    const lon2 = shelter.coordinates.longitude * Math.PI / 180;
    
    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = 6371 * c; // Earth radius in km
    
    return distance <= radiusKm;
  });
};

/**
 * Get a specific alert by ID
 */
const getAlertById = async (id: string): Promise<DisasterAlert | null> => {
  const allAlerts = await getActiveAlerts();
  return allAlerts.find(alert => alert.id === id) || null;
};

// Export the real data service
export const realDataService = {
  getActiveAlerts,
  getAlertsNearLocation,
  getNearbyShelters,
  getAlertById,
  // Stub implementations for required interface methods
  addAlert: async () => "not-implemented",
  updateAlert: async () => true,
  deleteAlert: async () => true,
  addShelter: async () => "not-implemented",
  updateShelter: async () => true,
  deleteShelter: async () => true
};

export default realDataService; 