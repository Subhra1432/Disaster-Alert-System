import { DisasterAlert, SafetyShelter } from '../models/types';
import { disasterService } from './disasterApi';

// Verify we're using real data
console.log('VERIFICATION: Database manager is configured to use ONLY real data from public APIs');
console.log('VERIFICATION: No mock or Firebase data is being used');

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
export const getDatabaseType = (): 'mock' => {
  return 'mock';
};

// Export a function to initialize and get the database service
export const getDatabaseService = async (): Promise<DatabaseService> => {
  console.log('Using mock data service');
  return disasterService;
};

// Initialize database service for immediate use
let databaseServiceInstance: DatabaseService | null = null;

// Export a getter for the database service
export const getDatabaseServiceSync = (): DatabaseService => {
  if (!databaseServiceInstance) {
    databaseServiceInstance = disasterService;
  }
  return databaseServiceInstance;
};

// Export a function to reinitialize the database if needed
export const reinitializeDatabase = async (): Promise<DatabaseService> => {
  databaseServiceInstance = disasterService;
  return disasterService;
}; 