import { DisasterAlert, SafetyShelter, DisasterType, AlertSeverity, Coordinates } from '../models/types';

/**
 * Simple SQLite database service for the Disaster Alert System
 * This service provides methods to interact with a local SQLite database
 * as an alternative to Firebase.
 */

// Import SQLite - In a real implementation, you would need to include a proper SQLite library
// For React/web apps, you can use SQL.js, IndexedDB, or localStorage based solutions
// This is a stub implementation showing how it would work conceptually

// Database initialization function
const initDatabase = async (): Promise<boolean> => {
  try {
    console.log('Initializing local SQLite database');
    
    // In a real implementation, this would initialize the database
    // For example:
    // const SQL = await initSqlJs();
    // const db = new SQL.Database();
    
    // Create tables
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS disasters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        severity TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        location_name TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        safety_tips TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        radius INTEGER NOT NULL,
        active INTEGER NOT NULL
      )
    `);
    
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS shelters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        address TEXT NOT NULL,
        capacity INTEGER NOT NULL,
        available INTEGER NOT NULL
      )
    `);
    
    // Seed initial data if database is empty
    const disasterCount = await getCount('disasters');
    const shelterCount = await getCount('shelters');
    
    if (disasterCount === 0) {
      console.log('Seeding disaster data');
      await seedDisasterData();
    }
    
    if (shelterCount === 0) {
      console.log('Seeding shelter data');
      await seedShelterData();
    }
    
    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
};

// Mock query execution - would be replaced with actual SQLite calls
const executeQuery = async (query: string, params: any[] = []): Promise<any> => {
  console.log('Executing query:', query, params);
  return true;
};

// Get count of records in a table
const getCount = async (tableName: string): Promise<number> => {
  // In a real implementation, this would execute a COUNT query
  console.log(`Getting count for table ${tableName}`);
  // For the mock implementation, return 0 to ensure seeding occurs
  return 0;
};

// Seed disaster data
const seedDisasterData = async (): Promise<void> => {
  const disasters = [
    {
      type: DisasterType.EARTHQUAKE,
      severity: AlertSeverity.HIGH,
      title: 'Major Earthquake',
      description: '7.2 magnitude earthquake detected near San Francisco',
      location_name: 'San Francisco, CA',
      latitude: 37.7749,
      longitude: -122.4194,
      safety_tips: JSON.stringify([
        'Drop, cover, and hold on',
        'Stay away from windows and exterior walls',
        'If outside, stay in open areas away from buildings',
        'Be prepared for aftershocks'
      ]),
      timestamp: new Date().toISOString(),
      radius: 100,
      active: 1
    },
    {
      type: DisasterType.FLOOD,
      severity: AlertSeverity.MEDIUM,
      title: 'Flash Flood Warning',
      description: 'Heavy rainfall causing flash flooding in Houston area',
      location_name: 'Houston, TX',
      latitude: 29.7604,
      longitude: -95.3698,
      safety_tips: JSON.stringify([
        'Move to higher ground immediately',
        'Do not walk or drive through flood waters',
        'Stay away from storm drains and culverts',
        'Follow evacuation orders if given'
      ]),
      timestamp: new Date().toISOString(),
      radius: 50,
      active: 1
    },
    {
      type: DisasterType.WILDFIRE,
      severity: AlertSeverity.CRITICAL,
      title: 'Wildfire Spreading Rapidly',
      description: 'Fast-moving wildfire threatening residential areas in northern California',
      location_name: 'Sonoma County, CA',
      latitude: 38.5078,
      longitude: -122.8097,
      safety_tips: JSON.stringify([
        'Follow evacuation orders immediately',
        'Pack emergency supplies and important documents',
        'Close all windows and doors before leaving',
        'Monitor local news for updates'
      ]),
      timestamp: new Date().toISOString(),
      radius: 75,
      active: 1
    }
  ];
  
  // Insert disaster data
  for (const disaster of disasters) {
    await executeQuery(
      `INSERT INTO disasters (
        type, severity, title, description, location_name, latitude, longitude,
        safety_tips, timestamp, radius, active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        disaster.type,
        disaster.severity,
        disaster.title,
        disaster.description,
        disaster.location_name,
        disaster.latitude,
        disaster.longitude,
        disaster.safety_tips,
        disaster.timestamp,
        disaster.radius,
        disaster.active
      ]
    );
  }
};

// Seed shelter data
const seedShelterData = async (): Promise<void> => {
  const shelters = [
    {
      name: 'Central High School Shelter',
      latitude: 37.7649,
      longitude: -122.4194,
      address: '123 Main St, San Francisco, CA',
      capacity: 500,
      available: 1
    },
    {
      name: 'Community Center Shelter',
      latitude: 29.7504,
      longitude: -95.3698,
      address: '456 Oak Dr, Houston, TX',
      capacity: 300,
      available: 1
    },
    {
      name: 'Red Cross Evacuation Center',
      latitude: 38.5178,
      longitude: -122.8197,
      address: '789 Pine Rd, Santa Rosa, CA',
      capacity: 450,
      available: 1
    }
  ];
  
  // Insert shelter data
  for (const shelter of shelters) {
    await executeQuery(
      `INSERT INTO shelters (
        name, latitude, longitude, address, capacity, available
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        shelter.name,
        shelter.latitude,
        shelter.longitude,
        shelter.address,
        shelter.capacity,
        shelter.available
      ]
    );
  }
};

// Convert DB row to DisasterAlert object
const rowToDisasterAlert = (row: any): DisasterAlert => {
  return {
    id: row.id.toString(),
    type: row.type as DisasterType,
    severity: row.severity as AlertSeverity,
    title: row.title,
    description: row.description,
    location: {
      name: row.location_name,
      coordinates: {
        latitude: row.latitude,
        longitude: row.longitude
      }
    },
    safetyTips: JSON.parse(row.safety_tips),
    timestamp: row.timestamp,
    radius: row.radius,
    active: row.active === 1
  };
};

// Convert DB row to SafetyShelter object
const rowToSafetyShelter = (row: any): SafetyShelter => {
  return {
    id: row.id.toString(),
    name: row.name,
    coordinates: {
      latitude: row.latitude,
      longitude: row.longitude
    },
    address: row.address,
    capacity: row.capacity,
    available: row.available === 1
  };
};

// Database Service API
export const localDatabaseService = {
  init: initDatabase,
  
  // Disasters
  
  // Get all active disaster alerts
  getActiveAlerts: async (): Promise<DisasterAlert[]> => {
    try {
      // In a real implementation, this would query the database
      // For example:
      // const result = await executeQuery('SELECT * FROM disasters WHERE active = 1');
      // return result.map(rowToDisasterAlert);
      
      // For this mock implementation, return the mock data
      return mockDisasterAlerts;
    } catch (error) {
      console.error('Error fetching alerts from database:', error);
      return [];
    }
  },
  
  // Get alerts near a specific location
  getAlertsNearLocation: async (
    latitude: number, 
    longitude: number, 
    radiusKm: number = 200
  ): Promise<DisasterAlert[]> => {
    try {
      // In a real implementation, this would query the database with a distance calculation
      // For example:
      /* 
      const result = await executeQuery(`
        SELECT *, (
          6371 * acos(
            cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + 
            sin(radians(?)) * sin(radians(latitude))
          )
        ) AS distance 
        FROM disasters 
        WHERE active = 1
        HAVING distance < ?
        ORDER BY distance
      `, [latitude, longitude, latitude, radiusKm]);
      return result.map(rowToDisasterAlert);
      */
      
      // For this mock implementation, return the mock data
      return mockDisasterAlerts;
    } catch (error) {
      console.error('Error fetching nearby alerts from database:', error);
      return [];
    }
  },
  
  // Get a specific alert by ID
  getAlertById: async (id: string): Promise<DisasterAlert | null> => {
    try {
      // In a real implementation, this would query the database
      // For example:
      // const result = await executeQuery('SELECT * FROM disasters WHERE id = ?', [id]);
      // return result.length > 0 ? rowToDisasterAlert(result[0]) : null;
      
      // For this mock implementation, return from mock data
      const alert = mockDisasterAlerts.find(a => a.id === id);
      return alert || null;
    } catch (error) {
      console.error('Error fetching alert by ID from database:', error);
      return null;
    }
  },
  
  // Add a new disaster alert
  addAlert: async (alert: Omit<DisasterAlert, 'id'>): Promise<string> => {
    try {
      // In a real implementation, this would insert into the database
      /* 
      const result = await executeQuery(
        `INSERT INTO disasters (
          type, severity, title, description, location_name, latitude, longitude,
          safety_tips, timestamp, radius, active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          alert.type,
          alert.severity,
          alert.title,
          alert.description,
          alert.location.name,
          alert.location.coordinates.latitude,
          alert.location.coordinates.longitude,
          JSON.stringify(alert.safetyTips),
          alert.timestamp,
          alert.radius,
          alert.active ? 1 : 0
        ]
      );
      return result.lastInsertRowId.toString();
      */
      
      // For this mock implementation, return a new ID
      return (mockDisasterAlerts.length + 1).toString();
    } catch (error) {
      console.error('Error adding alert to database:', error);
      throw error;
    }
  },
  
  // Update an existing alert
  updateAlert: async (id: string, data: Partial<DisasterAlert>): Promise<boolean> => {
    try {
      // In a real implementation, this would update the database
      // This is more complex as we need to build a dynamic update query
      console.log(`Updating alert ${id} with data:`, data);
      return true;
    } catch (error) {
      console.error('Error updating alert in database:', error);
      return false;
    }
  },
  
  // Delete an alert
  deleteAlert: async (id: string): Promise<boolean> => {
    try {
      // In a real implementation, this would delete from the database
      // For example:
      // await executeQuery('DELETE FROM disasters WHERE id = ?', [id]);
      console.log(`Deleting alert ${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting alert from database:', error);
      return false;
    }
  },
  
  // Shelters
  
  // Get nearby shelters
  getNearbyShelters: async (
    latitude: number, 
    longitude: number, 
    radiusKm: number = 50
  ): Promise<SafetyShelter[]> => {
    try {
      // In a real implementation, this would query the database with a distance calculation
      // Similar to getAlertsNearLocation
      
      // For this mock implementation, return the mock data
      return mockSafetyShelters;
    } catch (error) {
      console.error('Error fetching shelters from database:', error);
      return [];
    }
  },
  
  // Add a new shelter
  addShelter: async (shelter: Omit<SafetyShelter, 'id'>): Promise<string> => {
    try {
      // In a real implementation, this would insert into the database
      // Similar to addAlert
      
      // For this mock implementation, return a new ID
      return (mockSafetyShelters.length + 1).toString();
    } catch (error) {
      console.error('Error adding shelter to database:', error);
      throw error;
    }
  },
  
  // Update an existing shelter
  updateShelter: async (id: string, data: Partial<SafetyShelter>): Promise<boolean> => {
    try {
      // In a real implementation, this would update the database
      console.log(`Updating shelter ${id} with data:`, data);
      return true;
    } catch (error) {
      console.error('Error updating shelter in database:', error);
      return false;
    }
  },
  
  // Delete a shelter
  deleteShelter: async (id: string): Promise<boolean> => {
    try {
      // In a real implementation, this would delete from the database
      console.log(`Deleting shelter ${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting shelter from database:', error);
      return false;
    }
  }
};

// Mock data for the mock implementation
const mockDisasterAlerts: DisasterAlert[] = [
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
  }
];

const mockSafetyShelters: SafetyShelter[] = [
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
  }
]; 