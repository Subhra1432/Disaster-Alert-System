# Disaster Alert System

A real-time disaster management and alerting system built with React, Material UI, and Leaflet maps.

## Features

- Interactive map showing disaster alerts and safety shelters
- Automatic detection of nearby disasters based on user's current location
- Distance calculation between current location and disaster zones
- Visual indicators for alert severity levels
- Responsive design for mobile and desktop use
- Real-time proximity warnings when user enters danger zones
- Flexible database architecture supporting both Firebase and SQLite

## Technology Stack

- React with TypeScript
- Material UI for component styling
- React Leaflet for interactive maps
- Geolocation API for user positioning
- Firebase Firestore for cloud-based data storage
- SQLite (via SQL.js) for local/offline database support
- Unified database interface with automated fallback

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/disaster-alert.git
cd disaster-alert
```

2. Install dependencies:
```bash
npm install
```

3. Configure database settings in the `.env` file:
```
# Database Configuration
# Options: 'firebase', 'sqlite', 'auto'
REACT_APP_PREFERRED_DB=sqlite

# Set to 'true' to use Firebase (requires Firebase credentials)
REACT_APP_USE_FIREBASE=false
```

4. Start the development server:
```bash
npm start
```

The application will be running at http://localhost:3000.

## Database Configuration

The application supports two database backends:

### SQLite (Default)

- Local browser-based database using SQL.js
- No setup required, works out of the box
- Data is not persisted between browser sessions (development/demo use only)

### Firebase Firestore

To use Firebase:

1. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Firestore database in your project
3. Create a web app in your Firebase project and get the configuration
4. Update your `.env` file with Firebase credentials:

```
REACT_APP_USE_FIREBASE=true
REACT_APP_PREFERRED_DB=firebase
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

For more database details, see [database-readme.md](./database-readme.md).

## Usage

- The map automatically detects and displays your current location when you allow location access
- Disaster alerts are color-coded by severity (red for critical, orange for high, etc.)
- Click on markers to view detailed information about disasters or shelters
- The side panel lists all active alerts sorted by severity
- "Nearby Alerts" section shows warnings that are in close proximity to your location
- Database indicator in the top-right shows which database is currently active

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenStreetMap for map data
- Leaflet.js for mapping library
- Material UI team for the component library
- SQL.js for SQLite implementation in the browser
- Firebase team for Firestore database 