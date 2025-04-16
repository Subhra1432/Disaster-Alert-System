# Disaster Alert System

A real-time disaster management and alerting system built with React, Material UI, and Leaflet maps.

## Features

- Live disaster data from real-world sources (USGS Earthquake API and NASA EONET)
- Interactive map showing disaster alerts and safety shelters
- Automatic detection of nearby disasters based on user's current location
- Distance calculation between current location and disaster zones
- Visual indicators for alert severity levels
- Responsive design for mobile and desktop use
- Real-time proximity warnings when user enters danger zones

## Data Sources

This application integrates with real-time data from the following public APIs:

- **USGS Earthquake API**: Provides real-time data about recent and significant earthquakes around the world
- **NASA EONET (Earth Observatory Natural Event Tracker)**: Provides data about natural events like wildfires, floods, and more

The shelters are generated programmatically based on the locations of real disasters.

## Technology Stack

- React with TypeScript
- Material UI for component styling
- React Leaflet for interactive maps
- Geolocation API for user positioning
- Public APIs for real disaster data
- CSV export functionality for data analysis

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Subhra1432/Disaster-Alert-System.git
cd Disaster-Alert-System
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
- Export data to CSV files for further analysis in Excel or other tools

## Data Export

The application allows exporting disaster data to CSV files:

1. Click "Export to Excel" buttons to download CSV files
2. Import these files into Excel, Google Sheets, or any spreadsheet software
3. Analyze disaster patterns, locations, and other data

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- USGS for earthquake data
- NASA EONET for natural disaster data
- OpenStreetMap for map data
- Leaflet.js for mapping library
- Material UI team for the component library 