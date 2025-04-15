import { DisasterAlert, SafetyShelter } from '../models/types';
import { db } from './firebase';
import { localDatabaseService } from './localDatabase';
import { disasterService as firebaseService } from './disasterApi';

// Environment variable to specify preferred database
// Possible values: 'firebase', 'sqlite', 'auto'
// If 'auto', it will try Firebase first, then fall back to SQLite if Firebase is not configured
const preferredDb = process.env.REACT_APP_PREFERRED_DB || 'auto';

// Check if Firebase is configured properly
const isFirebaseConfigured = () => {
  try {
    return db !== undefined && process.env.REACT_APP_USE_FIREBASE === 'true';
  } catch (e) {
    console.warn('Firebase not properly configured');
    return false;
  }
};

// DatabaseService interface defines the methods required for both implementations
interface DatabaseService {
  // Disaster alerts
  getActiveAlerts(): Promise<DisasterAlert[]>;
  getAlertsNearLocation(latitude: number, longitude: number, radiusKm?: number): Promise<DisasterAlert[]>;
  getAlertById(id: string): Promise<DisasterAlert | null>;
  addAlert(alert: Omit<DisasterAlert, 'id'>): Promise<string>;
  updateAlert(id: string, data: Partial<DisasterAlert>): Promise<any>;
  deleteAlert(id: string): Promise<any>;
  
  // Shelters
  getNearbyShelters(latitude: number, longitude: number, radiusKm?: number): Promise<SafetyShelter[]>;
  addShelter(shelter: Omit<SafetyShelter, 'id'>): Promise<string>;
  updateShelter(id: string, data: Partial<SafetyShelter>): Promise<any>;
  deleteShelter(id: string): Promise<any>;
}

// Create adapter for Firebase service to match our interface
const createFirebaseAdapter = (): DatabaseService => {
  return {
    ...firebaseService,
    // Ensure returned types match our interface
    deleteAlert: async (id: string): Promise<any> => {
      return await firebaseService.deleteAlert(id);
    },
    updateShelter: async (id: string, data: Partial<SafetyShelter>): Promise<any> => {
      return await firebaseService.updateShelter(id, data);
    },
    deleteShelter: async (id: string): Promise<any> => {
      return await firebaseService.deleteShelter(id);
    }
  };
};

// Initialize database based on configuration
const initializeDatabase = async (): Promise<DatabaseService> => {
  // If specifically requesting SQLite
  if (preferredDb === 'sqlite') {
    console.log('Using SQLite database as specified');
    await localDatabaseService.init();
    return localDatabaseService;
  }
  
  // If specifically requesting Firebase
  if (preferredDb === 'firebase') {
    if (isFirebaseConfigured()) {
      console.log('Using Firebase database as specified');
      return createFirebaseAdapter();
    } else {
      console.warn('Firebase specified but not configured correctly. Falling back to SQLite');
      await localDatabaseService.init();
      return localDatabaseService;
    }
  }
  
  // Auto mode - try Firebase first, then fall back to SQLite
  if (isFirebaseConfigured()) {
    console.log('Using Firebase database (auto-detected)');
    return createFirebaseAdapter();
  } else {
    console.log('Firebase not configured, using SQLite database');
    await localDatabaseService.init();
    return localDatabaseService;
  }
};

// Get the current database type
export const getDatabaseType = (): 'firebase' | 'sqlite' => {
  if (preferredDb === 'sqlite' || (!isFirebaseConfigured() && preferredDb === 'auto')) {
    return 'sqlite';
  }
  return 'firebase';
};

// Export a function to initialize and get the database service
export const getDatabaseService = async (): Promise<DatabaseService> => {
  return await initializeDatabase();
};

// Initialize database service for immediate use
let databaseServiceInstance: DatabaseService | null = null;

// Export a getter for the database service
export const getDatabaseServiceSync = (): DatabaseService => {
  if (!databaseServiceInstance) {
    console.warn('Database service not initialized. Initializing now...');
    // Perform initialization on first access
    initializeDatabase().then(service => {
      databaseServiceInstance = service;
    });
    
    // Return localDatabaseService as a fallback while initializing
    return localDatabaseService;
  }
  return databaseServiceInstance;
};

// Export a function to reinitialize the database if needed
export const reinitializeDatabase = async (): Promise<DatabaseService> => {
  const service = await initializeDatabase();
  databaseServiceInstance = service;
  return service;
}; 