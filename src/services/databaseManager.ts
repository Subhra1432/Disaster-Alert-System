import { DisasterAlert, SafetyShelter } from '../models/types';
import { realDataService } from './realDataService';

// DatabaseService interface defines the methods required
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

// Get the current database type
export const getDatabaseType = (): 'real-api' => {
  return 'real-api';
};

// Export a function to initialize and get the database service
export const getDatabaseService = async (): Promise<DatabaseService> => {
  console.log('Initializing real data service from public APIs');
  return realDataService;
};

// Initialize database service for immediate use
let databaseServiceInstance: DatabaseService | null = null;

// Export a getter for the database service
export const getDatabaseServiceSync = (): DatabaseService => {
  if (!databaseServiceInstance) {
    console.log('Database service not initialized. Using real data service.');
    databaseServiceInstance = realDataService;
  }
  return databaseServiceInstance;
};

// Export a function to reinitialize the database if needed
export const reinitializeDatabase = async (): Promise<DatabaseService> => {
  databaseServiceInstance = realDataService;
  return realDataService;
}; 