# Disaster Alert System Database Implementation

This document explains the database implementation for the Disaster Alert System, which supports both Firebase and SQLite database options.

## Overview

The Disaster Alert System uses a flexible database architecture that allows switching between:

1. **Firebase Firestore**: Cloud-based NoSQL database for production use
2. **SQLite**: Local database for development or when Firebase is not available/configured

The system automatically determines which database to use based on configuration and availability, with fallback mechanisms to ensure the application always has a working data store.

## Database Manager

The central component of our database system is the `databaseManager` service, which:

1. Provides a unified interface for database operations
2. Handles initialization and configuration
3. Manages the selection of the appropriate database backend
4. Provides adapters to ensure consistent behavior across implementations

## Configuration

The database system is configured through environment variables in the `.env` file:

```
# Firebase Configuration
REACT_APP_USE_FIREBASE=false|true

# Firebase credentials (when using Firebase)
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
# ... other Firebase settings ...

# Database Configuration
# Options: 'firebase', 'sqlite', 'auto'
REACT_APP_PREFERRED_DB=sqlite
```

### Configuration Options

- `REACT_APP_USE_FIREBASE`: Enable/disable Firebase integration
- `REACT_APP_PREFERRED_DB`:
  - `firebase`: Use Firebase exclusively (falls back to SQLite if Firebase is not available)
  - `sqlite`: Use SQLite exclusively
  - `auto`: Automatically select the best option (prefers Firebase if available)

## Database Schema

Both database implementations share the same data structure:

### Disasters Table

| Field | Type | Description |
|-------|------|-------------|
| id | String | Unique identifier |
| type | String | Disaster type (EARTHQUAKE, FLOOD, etc.) |
| severity | String | Severity level (LOW, MEDIUM, HIGH, CRITICAL) |
| title | String | Alert title |
| description | String | Detailed description |
| location_name | String | Readable location name |
| latitude | Number | Location latitude |
| longitude | Number | Location longitude |
| safety_tips | Array/JSON | List of safety instructions |
| timestamp | String | ISO timestamp of the event |
| radius | Number | Affected radius in kilometers |
| active | Boolean | Whether the alert is active |

### Shelters Table

| Field | Type | Description |
|-------|------|-------------|
| id | String | Unique identifier |
| name | String | Shelter name |
| latitude | Number | Location latitude |
| longitude | Number | Location longitude |
| address | String | Full address |
| capacity | Number | Maximum capacity |
| available | Boolean | Whether the shelter is currently available |

## Implementation Details

### Firebase Implementation

- Uses Firebase Firestore for data storage
- Supports real-time updates (not fully implemented in current version)
- Requires valid Firebase credentials and configuration
- Data is stored in the cloud and can be accessed from multiple devices

### SQLite Implementation

- Uses SQL.js for a client-side SQLite database
- Data is stored locally in the browser
- No server or cloud services required
- Ideal for development, testing, or offline use
- Database is initialized with sample data on first use

## API

Both implementations provide the same API through the database service:

### Alerts

- `getActiveAlerts()`: Fetch all active alerts
- `getAlertsNearLocation(latitude, longitude, radius)`: Find alerts near a location
- `getAlertById(id)`: Get a specific alert
- `addAlert(alert)`: Create a new alert
- `updateAlert(id, data)`: Update an existing alert
- `deleteAlert(id)`: Delete an alert

### Shelters

- `getNearbyShelters(latitude, longitude, radius)`: Find shelters near a location
- `addShelter(shelter)`: Create a new shelter
- `updateShelter(id, data)`: Update an existing shelter
- `deleteShelter(id)`: Delete a shelter

## Using the Database Service

To use the database service in components:

```typescript
import { getDatabaseServiceSync, getDatabaseType } from '../services/databaseManager';

// Get the current database type ('firebase' or 'sqlite')
const dbType = getDatabaseType();

// Get the database service
const dbService = getDatabaseServiceSync();

// Use the service
const alerts = await dbService.getActiveAlerts();
```

## Development and Testing

For development and testing:

1. Set `REACT_APP_PREFERRED_DB=sqlite` in your `.env` file
2. The SQLite database will be initialized with sample data
3. All database operations will use the local SQLite database

For production with Firebase:

1. Set `REACT_APP_USE_FIREBASE=true` in your `.env` file
2. Set `REACT_APP_PREFERRED_DB=firebase` or `auto`
3. Configure all Firebase credentials
4. The application will use Firebase Firestore for data storage

## Limitations

### SQLite Implementation

- Data is not persisted between browser sessions (stored in memory)
- No real-time updates
- Limited to browser storage constraints
- Not suitable for production use with real user data

### Firebase Implementation

- Requires valid Firebase credentials
- May incur costs depending on usage
- Requires internet connectivity 