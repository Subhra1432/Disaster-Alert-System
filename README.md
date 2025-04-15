# Disaster Alert System

A real-time disaster management and alerting system built with React, Material UI, and Leaflet maps.

## Features

- Interactive map showing disaster alerts and safety shelters
- Automatic detection of nearby disasters based on user's current location
- Distance calculation between current location and disaster zones
- Visual indicators for alert severity levels
- Responsive design for mobile and desktop use
- Real-time proximity warnings when user enters danger zones

## Technology Stack

- React with TypeScript
- Material UI for component styling
- React Leaflet for interactive maps
- Geolocation API for user positioning
- Mock data service with real-time simulations

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

3. Start the development server:
```bash
npm start
```

The application will be running at http://localhost:3000.

## Usage

- The map automatically detects and displays your current location when you allow location access
- Disaster alerts are color-coded by severity (red for critical, orange for high, etc.)
- Click on markers to view detailed information about disasters or shelters
- The side panel lists all active alerts sorted by severity
- "Nearby Alerts" section shows warnings that are in close proximity to your location

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenStreetMap for map data
- Leaflet.js for mapping library
- Material UI team for the component library 