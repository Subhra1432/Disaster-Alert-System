import { DisasterAlert, DisasterType, AlertSeverity, SafetyShelter } from '../models/types';
import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where, 
  addDoc, 
  updateDoc,
  deleteDoc,
  GeoPoint,
  serverTimestamp
} from 'firebase/firestore';
import { calculateDistance } from '../utils/locationUtils';

// Check if Firebase is configured properly
const isFirebaseConfigured = () => {
  try {
    return db !== undefined && process.env.REACT_APP_USE_FIREBASE === 'true';
  } catch (e) {
    console.warn('Firebase not properly configured, using mock data');
    return false;
  }
};

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
    timestamp: new Date().toISOString(),
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
    timestamp: new Date().toISOString(),
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
    timestamp: new Date().toISOString(),
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
    timestamp: new Date().toISOString(),
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
    timestamp: new Date().toISOString(),
    radius: 150,
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
  }
];

// Helper function to convert Firestore document to DisasterAlert
const convertFirestoreAlertDoc = (doc: any): DisasterAlert => {
  const data = doc.data();
  return {
    id: doc.id,
    type: data.type,
    severity: data.severity,
    title: data.title,
    description: data.description,
    location: {
      name: data.location.name,
      coordinates: {
        latitude: data.location.coordinates.latitude || data.location.coordinates._lat,
        longitude: data.location.coordinates.longitude || data.location.coordinates._long
      }
    },
    safetyTips: data.safetyTips,
    timestamp: data.timestamp?.toDate?.() ? data.timestamp.toDate().toISOString() : new Date().toISOString(),
    radius: data.radius,
    active: data.active
  };
};

// Helper function to convert Firestore document to SafetyShelter
const convertFirestoreShelterDoc = (doc: any): SafetyShelter => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    coordinates: {
      latitude: data.coordinates.latitude || data.coordinates._lat,
      longitude: data.coordinates.longitude || data.coordinates._long
    },
    address: data.address,
    capacity: data.capacity,
    available: data.available
  };
};

// API service
export const disasterService = {
  // Get all active disaster alerts
  getActiveAlerts: async (): Promise<DisasterAlert[]> => {
    if (isFirebaseConfigured()) {
      try {
        const alertsQuery = query(
          collection(db, 'disasters'),
          where('active', '==', true)
        );
        const querySnapshot = await getDocs(alertsQuery);
        return querySnapshot.docs.map(convertFirestoreAlertDoc);
      } catch (error) {
        console.error('Error fetching alerts from Firestore:', error);
        return mockDisasters.filter(disaster => disaster.active);
      }
    } else {
      // Use mock data
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockDisasters.filter(disaster => disaster.active));
        }, 500);
      });
    }
  },

  // Get alerts near a specific location
  getAlertsNearLocation: async (latitude: number, longitude: number, radiusKm: number = 200): Promise<DisasterAlert[]> => {
    if (isFirebaseConfigured()) {
      try {
        // Fetch all active alerts
        const alertsQuery = query(
          collection(db, 'disasters'),
          where('active', '==', true)
        );
        const querySnapshot = await getDocs(alertsQuery);
        const allAlerts = querySnapshot.docs.map(convertFirestoreAlertDoc);
        
        // Filter by distance (Firestore doesn't support geospatial queries directly in the free tier)
        return allAlerts.filter(alert => {
          const distance = calculateDistance(
            latitude,
            longitude,
            alert.location.coordinates.latitude,
            alert.location.coordinates.longitude
          );
          return distance <= radiusKm;
        });
      } catch (error) {
        console.error('Error fetching nearby alerts from Firestore:', error);
        return mockDisasters.filter(disaster => disaster.active);
      }
    } else {
      // Use mock data
      return new Promise((resolve) => {
        setTimeout(() => {
          const nearbyAlerts = mockDisasters.filter(disaster => {
            // Simple distance calculation for demo
            return disaster.active;
          });
          resolve(nearbyAlerts);
        }, 500);
      });
    }
  },

  // Get a specific alert by ID
  getAlertById: async (id: string): Promise<DisasterAlert | null> => {
    if (isFirebaseConfigured()) {
      try {
        const alertDoc = await getDoc(doc(db, 'disasters', id));
        if (alertDoc.exists()) {
          return convertFirestoreAlertDoc(alertDoc);
        }
        return null;
      } catch (error) {
        console.error('Error fetching alert by ID from Firestore:', error);
        const mockAlert = mockDisasters.find(d => d.id === id);
        return mockAlert || null;
      }
    } else {
      // Use mock data
      return new Promise((resolve) => {
        setTimeout(() => {
          const alert = mockDisasters.find(d => d.id === id);
          resolve(alert || null);
        }, 300);
      });
    }
  },

  // Add a new disaster alert
  addAlert: async (alert: Omit<DisasterAlert, 'id'>): Promise<string> => {
    if (isFirebaseConfigured()) {
      try {
        const alertData = {
          ...alert,
          location: {
            ...alert.location,
            coordinates: new GeoPoint(
              alert.location.coordinates.latitude,
              alert.location.coordinates.longitude
            )
          },
          timestamp: serverTimestamp()
        };
        
        const docRef = await addDoc(collection(db, 'disasters'), alertData);
        return docRef.id;
      } catch (error) {
        console.error('Error adding alert to Firestore:', error);
        throw error;
      }
    } else {
      // Mock adding data
      return new Promise((resolve) => {
        setTimeout(() => {
          const newId = (mockDisasters.length + 1).toString();
          resolve(newId);
        }, 300);
      });
    }
  },

  // Update an existing disaster alert
  updateAlert: async (id: string, alertData: Partial<DisasterAlert>): Promise<void> => {
    if (isFirebaseConfigured()) {
      try {
        // Handle coordinates GeoPoint if provided
        let dataToUpdate = { ...alertData };
        
        if (alertData.location?.coordinates) {
          dataToUpdate.location = {
            ...alertData.location,
            coordinates: new GeoPoint(
              alertData.location.coordinates.latitude,
              alertData.location.coordinates.longitude
            )
          };
        }
        
        await updateDoc(doc(db, 'disasters', id), dataToUpdate);
      } catch (error) {
        console.error('Error updating alert in Firestore:', error);
        throw error;
      }
    } else {
      // Mock update
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 300);
      });
    }
  },

  // Delete a disaster alert
  deleteAlert: async (id: string): Promise<void> => {
    if (isFirebaseConfigured()) {
      try {
        await deleteDoc(doc(db, 'disasters', id));
      } catch (error) {
        console.error('Error deleting alert from Firestore:', error);
        throw error;
      }
    } else {
      // Mock delete
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 300);
      });
    }
  },

  // Get nearby shelters
  getNearbyShelters: async (latitude: number, longitude: number, radiusKm: number = 50): Promise<SafetyShelter[]> => {
    if (isFirebaseConfigured()) {
      try {
        // Fetch all shelters
        const sheltersSnapshot = await getDocs(collection(db, 'shelters'));
        const allShelters = sheltersSnapshot.docs.map(convertFirestoreShelterDoc);
        
        // Filter by distance
        return allShelters.filter(shelter => {
          const distance = calculateDistance(
            latitude,
            longitude,
            shelter.coordinates.latitude,
            shelter.coordinates.longitude
          );
          return distance <= radiusKm;
        });
      } catch (error) {
        console.error('Error fetching shelters from Firestore:', error);
        return mockShelters;
      }
    } else {
      // Use mock data
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockShelters);
        }, 500);
      });
    }
  },

  // Add a new shelter
  addShelter: async (shelter: Omit<SafetyShelter, 'id'>): Promise<string> => {
    if (isFirebaseConfigured()) {
      try {
        const shelterData = {
          ...shelter,
          coordinates: new GeoPoint(
            shelter.coordinates.latitude,
            shelter.coordinates.longitude
          )
        };
        
        const docRef = await addDoc(collection(db, 'shelters'), shelterData);
        return docRef.id;
      } catch (error) {
        console.error('Error adding shelter to Firestore:', error);
        throw error;
      }
    } else {
      // Mock adding data
      return new Promise((resolve) => {
        setTimeout(() => {
          const newId = (mockShelters.length + 1).toString();
          resolve(newId);
        }, 300);
      });
    }
  },

  // Update a shelter
  updateShelter: async (id: string, shelterData: Partial<SafetyShelter>): Promise<void> => {
    if (isFirebaseConfigured()) {
      try {
        // Handle coordinates GeoPoint if provided
        let dataToUpdate = { ...shelterData };
        
        if (shelterData.coordinates) {
          dataToUpdate.coordinates = new GeoPoint(
            shelterData.coordinates.latitude,
            shelterData.coordinates.longitude
          );
        }
        
        await updateDoc(doc(db, 'shelters', id), dataToUpdate);
      } catch (error) {
        console.error('Error updating shelter in Firestore:', error);
        throw error;
      }
    } else {
      // Mock update
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 300);
      });
    }
  },

  // Delete a shelter
  deleteShelter: async (id: string): Promise<void> => {
    if (isFirebaseConfigured()) {
      try {
        await deleteDoc(doc(db, 'shelters', id));
      } catch (error) {
        console.error('Error deleting shelter from Firestore:', error);
        throw error;
      }
    } else {
      // Mock delete
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 300);
      });
    }
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