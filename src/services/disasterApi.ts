import { DisasterAlert, DisasterType, AlertSeverity, SafetyShelter } from '../models/types';
import { calculateDistance } from '../utils/locationUtils';

// Mock disaster data
const mockDisasters: DisasterAlert[] = [
  {
    id: '1',
    type: DisasterType.EARTHQUAKE,
    severity: AlertSeverity.HIGH,
    title: 'Major Earthquake',
    description: '7.2 magnitude earthquake detected near San Francisco',
    location: {
      name: 'San Francisco, CA',
      coordinates: { latitude: 37.7749, longitude: -122.4194 }
    },
    safetyTips: [
      'Drop, cover, and hold on',
      'Stay away from windows and exterior walls',
      'If outside, stay in open areas away from buildings',
      'Be prepared for aftershocks'
    ],
    timestamp: '2023-10-15T08:30:00.000Z',
    radius: 100,
    active: true
  },
  {
    id: '2',
    type: DisasterType.FLOOD,
    severity: AlertSeverity.MEDIUM,
    title: 'Flash Flood Warning',
    description: 'Heavy rainfall causing flash flooding in Houston area',
    location: {
      name: 'Houston, TX',
      coordinates: { latitude: 29.7604, longitude: -95.3698 }
    },
    safetyTips: [
      'Move to higher ground immediately',
      'Do not walk or drive through flood waters',
      'Stay away from storm drains and culverts',
      'Follow evacuation orders if given'
    ],
    timestamp: '2023-09-22T14:45:00.000Z',
    radius: 50,
    active: true
  },
  {
    id: '3',
    type: DisasterType.WILDFIRE,
    severity: AlertSeverity.CRITICAL,
    title: 'Wildfire Spreading Rapidly',
    description: 'Fast-moving wildfire threatening residential areas in northern California',
    location: {
      name: 'Sonoma County, CA',
      coordinates: { latitude: 38.5078, longitude: -122.8097 }
    },
    safetyTips: [
      'Follow evacuation orders immediately',
      'Pack emergency supplies and important documents',
      'Close all windows and doors before leaving',
      'Monitor local news for updates'
    ],
    timestamp: '2023-11-03T10:15:00.000Z',
    radius: 75,
    active: true
  },
  {
    id: '4',
    type: DisasterType.HURRICANE,
    severity: AlertSeverity.HIGH,
    title: 'Hurricane Approaching',
    description: 'Category 3 hurricane expected to make landfall within 24 hours',
    location: {
      name: 'Miami, FL',
      coordinates: { latitude: 25.7617, longitude: -80.1918 }
    },
    safetyTips: [
      'Evacuate if in a vulnerable area or mobile home',
      'Secure outdoor items that could become projectiles',
      'Have emergency supplies ready',
      'Stay away from windows during the storm'
    ],
    timestamp: '2023-08-30T09:00:00.000Z',
    radius: 200,
    active: true
  },
  {
    id: '5',
    type: DisasterType.TSUNAMI,
    severity: AlertSeverity.CRITICAL,
    title: 'Tsunami Warning',
    description: 'Possible tsunami following offshore earthquake',
    location: {
      name: 'Honolulu, HI',
      coordinates: { latitude: 21.3069, longitude: -157.8583 }
    },
    safetyTips: [
      'Move immediately to higher ground',
      'Follow evacuation routes',
      'Stay away from the coast',
      'Do not return until officials say it is safe'
    ],
    timestamp: '2023-12-05T05:30:00.000Z',
    radius: 150,
    active: true
  },
  {
    id: '6',
    type: DisasterType.FLOOD,
    severity: AlertSeverity.HIGH,
    title: 'Monsoon Flooding',
    description: 'Severe flooding in Kerala due to intense monsoon rainfall',
    location: {
      name: 'Kochi, Kerala, India',
      coordinates: { latitude: 9.9312, longitude: 76.2673 }
    },
    safetyTips: [
      'Evacuate to designated relief camps',
      'Stay away from floodwaters which may be contaminated',
      'Keep essential medicines and documents in waterproof containers',
      'Follow instructions from local disaster management authorities'
    ],
    timestamp: '2023-07-18T06:15:00.000Z',
    radius: 80,
    active: true
  },
  {
    id: '7',
    type: DisasterType.EARTHQUAKE,
    severity: AlertSeverity.MEDIUM,
    title: 'Earthquake in Himalayan Region',
    description: '5.8 magnitude earthquake reported in Northern India',
    location: {
      name: 'Dehradun, Uttarakhand, India',
      coordinates: { latitude: 30.3165, longitude: 78.0322 }
    },
    safetyTips: [
      'Stay away from buildings with visible damage',
      'Be prepared for aftershocks',
      'Keep emergency supplies handy',
      'Listen to local radio for updates and instructions'
    ],
    timestamp: '2023-11-28T04:45:00.000Z',
    radius: 60,
    active: true
  },
  {
    id: '8',
    type: DisasterType.HURRICANE,
    severity: AlertSeverity.CRITICAL,
    title: 'Cyclone Approaching Eastern Coast',
    description: 'Super Cyclone with wind speeds over 200 km/h approaching Odisha coast',
    location: {
      name: 'Bhubaneswar, Odisha, India',
      coordinates: { latitude: 20.2961, longitude: 85.8245 }
    },
    safetyTips: [
      'Move to designated cyclone shelters immediately',
      'Secure loose items outside your home',
      'Keep emergency kit ready with food, water, and medicines',
      'Stay informed through official weather updates'
    ],
    timestamp: '2023-06-08T11:30:00.000Z',
    radius: 180,
    active: true
  }
];

// Mock shelter data
const mockShelters: SafetyShelter[] = [
  {
    id: '1',
    name: 'Central High School Shelter',
    coordinates: { latitude: 37.7649, longitude: -122.4194 },
    address: '123 Main St, San Francisco, CA',
    capacity: 500,
    available: true
  },
  {
    id: '2',
    name: 'Community Center Shelter',
    coordinates: { latitude: 29.7504, longitude: -95.3698 },
    address: '456 Oak Dr, Houston, TX',
    capacity: 300,
    available: true
  },
  {
    id: '3',
    name: 'Red Cross Evacuation Center',
    coordinates: { latitude: 38.5178, longitude: -122.8197 },
    address: '789 Pine Rd, Santa Rosa, CA',
    capacity: 450,
    available: true
  },
  {
    id: '4',
    name: 'Hurricane Evacuation Center',
    coordinates: { latitude: 25.7717, longitude: -80.1918 },
    address: '101 Beach Blvd, Miami, FL',
    capacity: 800,
    available: true
  },
  {
    id: '5',
    name: 'Tsunami Relief Center',
    coordinates: { latitude: 21.3169, longitude: -157.8583 },
    address: '555 Palm Ave, Honolulu, HI',
    capacity: 600,
    available: true
  },
  {
    id: '6',
    name: 'Kerala State Relief Camp',
    coordinates: { latitude: 9.9389, longitude: 76.2569 },
    address: 'Government School, Ernakulam, Kerala, India',
    capacity: 350,
    available: true
  },
  {
    id: '7',
    name: 'Uttarakhand Disaster Management Center',
    coordinates: { latitude: 30.3245, longitude: 78.0419 },
    address: 'Civil Lines, Dehradun, Uttarakhand, India',
    capacity: 250,
    available: true
  },
  {
    id: '8',
    name: 'Odisha Super Cyclone Shelter',
    coordinates: { latitude: 20.2850, longitude: 85.8139 },
    address: 'Municipal Hall, Bhubaneswar, Odisha, India',
    capacity: 700,
    available: true
  },
  {
    id: '9',
    name: 'Mumbai Flood Relief Center',
    coordinates: { latitude: 19.0760, longitude: 72.8777 },
    address: 'Municipal School, Dadar, Mumbai, Maharashtra, India',
    capacity: 500,
    available: true
  }
];

// API service with mock data (Firebase removed)
export const disasterService = {
  // Get all active disaster alerts
  getActiveAlerts: async (): Promise<DisasterAlert[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockDisasters.filter(disaster => disaster.active));
      }, 500);
    });
  },

  // Get alerts near a specific location
  getAlertsNearLocation: async (latitude: number, longitude: number, radiusKm: number = 200): Promise<DisasterAlert[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const nearbyAlerts = mockDisasters.filter(disaster => {
          // Check if active and within specified radius
          if (!disaster.active) return false;
          
          const distance = calculateDistance(
            latitude,
            longitude,
            disaster.location.coordinates.latitude,
            disaster.location.coordinates.longitude
          );
          return distance <= radiusKm;
        });
        resolve(nearbyAlerts);
      }, 500);
    });
  },

  // Get a specific alert by ID
  getAlertById: async (id: string): Promise<DisasterAlert | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const alert = mockDisasters.find(d => d.id === id);
        resolve(alert || null);
      }, 300);
    });
  },

  // Add a new disaster alert
  addAlert: async (alert: Omit<DisasterAlert, 'id'>): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newId = (mockDisasters.length + 1).toString();
        resolve(newId);
      }, 300);
    });
  },

  // Update an existing disaster alert
  updateAlert: async (id: string, alertData: Partial<DisasterAlert>): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 300);
    });
  },

  // Delete a disaster alert
  deleteAlert: async (id: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 300);
    });
  },

  // Get nearby shelters
  getNearbyShelters: async (latitude: number, longitude: number, radiusKm: number = 50): Promise<SafetyShelter[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const nearbyShelters = mockShelters.filter(shelter => {
          const distance = calculateDistance(
            latitude,
            longitude,
            shelter.coordinates.latitude,
            shelter.coordinates.longitude
          );
          return distance <= radiusKm;
        });
        resolve(nearbyShelters);
      }, 500);
    });
  },

  // Add a new shelter
  addShelter: async (shelter: Omit<SafetyShelter, 'id'>): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newId = (mockShelters.length + 1).toString();
        resolve(newId);
      }, 300);
    });
  },

  // Update a shelter
  updateShelter: async (id: string, shelterData: Partial<SafetyShelter>): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 300);
    });
  },

  // Delete a shelter
  deleteShelter: async (id: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 300);
    });
  },

  // AI severity classifier (mock function)
  classifyDisasterSeverity: (
    type: DisasterType, 
    params: { [key: string]: number }
  ): Promise<AlertSeverity> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock AI logic for severity classification
        let severity: AlertSeverity;
        
        switch (type) {
          case DisasterType.EARTHQUAKE:
            // Based on magnitude
            const magnitude = params.magnitude || 0;
            if (magnitude < 4.0) severity = AlertSeverity.LOW;
            else if (magnitude < 6.0) severity = AlertSeverity.MEDIUM;
            else if (magnitude < 7.5) severity = AlertSeverity.HIGH;
            else severity = AlertSeverity.CRITICAL;
            break;
            
          case DisasterType.FLOOD:
            // Based on water level rise in feet
            const waterLevel = params.waterLevel || 0;
            if (waterLevel < 3) severity = AlertSeverity.LOW;
            else if (waterLevel < 8) severity = AlertSeverity.MEDIUM;
            else if (waterLevel < 15) severity = AlertSeverity.HIGH;
            else severity = AlertSeverity.CRITICAL;
            break;
            
          case DisasterType.HURRICANE:
            // Based on wind speed in mph
            const windSpeed = params.windSpeed || 0;
            if (windSpeed < 74) severity = AlertSeverity.LOW;
            else if (windSpeed < 110) severity = AlertSeverity.MEDIUM;
            else if (windSpeed < 130) severity = AlertSeverity.HIGH;
            else severity = AlertSeverity.CRITICAL;
            break;
            
          default:
            // Default moderate level if type not handled specifically
            severity = AlertSeverity.MEDIUM;
        }
        
        resolve(severity);
      }, 300);
    });
  }
}; 