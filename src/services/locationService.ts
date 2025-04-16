import { UserLocation } from '../models/types';

export const locationService = {
  // Get the current user location using the browser's Geolocation API
  getCurrentLocation(): Promise<UserLocation> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            coordinates: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            },
            accuracy: position.coords.accuracy,
            name: "Current Location"
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  },
  
  // Mock location for testing when geolocation is not available
  getMockLocation(): UserLocation {
    // Default to San Francisco for demo purposes
    return {
      coordinates: {
        latitude: 37.7749,
        longitude: -122.4194
      },
      accuracy: 10,
      name: "San Francisco, CA"
    };
  },
  
  // Get user location with fallback to mock data
  getUserLocation(): Promise<UserLocation> {
    return new Promise((resolve) => {
      this.getCurrentLocation()
        .then(location => {
          resolve(location);
        })
        .catch(() => {
          // If geolocation fails, use a more central global position
          // This position is chosen to better show both US and Indian data
          resolve({
            coordinates: {
              latitude: 20.0000, // More central global position
              longitude: 0.0000  // Prime meridian
            },
            accuracy: 1000,      // Lower accuracy for wider view
            name: "Global View"
          });
        });
    });
  }
}; 