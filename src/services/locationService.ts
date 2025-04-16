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
      // Simulate a delay
      setTimeout(() => {
        resolve({
          coordinates: {
            latitude: 37.7749,
            longitude: -122.4194
          },
          accuracy: 10,
          name: "San Francisco, CA"
        });
      }, 500);
    });
  }
}; 