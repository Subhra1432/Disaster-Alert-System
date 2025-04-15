export enum DisasterType {
  EARTHQUAKE = 'EARTHQUAKE',
  FLOOD = 'FLOOD',
  WILDFIRE = 'WILDFIRE',
  HURRICANE = 'HURRICANE',
  TSUNAMI = 'TSUNAMI'
}

export enum AlertSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface DisasterAlert {
  id: string;
  type: DisasterType;
  severity: AlertSeverity;
  title: string;
  description: string;
  location: {
    name: string;
    coordinates: Coordinates;
  };
  safetyTips: string[];
  timestamp: string;
  radius: number; // affected radius in kilometers
  active: boolean;
}

export interface UserLocation {
  coordinates: Coordinates;
  accuracy: number;
}

export interface SafetyShelter {
  id: string;
  name: string;
  coordinates: Coordinates;
  address: string;
  capacity: number;
  available: boolean;
}
