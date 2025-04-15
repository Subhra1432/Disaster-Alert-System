/**
 * Calculates the distance between two points in kilometers using the Haversine formula
 * @param lat1 Latitude of first point in decimal degrees
 * @param lon1 Longitude of first point in decimal degrees
 * @param lat2 Latitude of second point in decimal degrees
 * @param lon2 Longitude of second point in decimal degrees
 * @returns Distance in kilometers
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Converts a coordinate to a friendly string format
 * @param latitude Latitude in decimal degrees
 * @param longitude Longitude in decimal degrees
 * @returns Formatted coordinate string (e.g., "40.7128° N, 74.0060° W")
 */
export const formatCoordinates = (latitude: number, longitude: number): string => {
  const latDirection = latitude >= 0 ? 'N' : 'S';
  const lonDirection = longitude >= 0 ? 'E' : 'W';
  return `${Math.abs(latitude).toFixed(4)}° ${latDirection}, ${Math.abs(longitude).toFixed(4)}° ${lonDirection}`;
};

/**
 * Gets a text description of the approximate distance
 * @param distanceKm Distance in kilometers
 * @returns Human-readable distance description
 */
export const getDistanceDescription = (distanceKm: number): string => {
  if (distanceKm < 0.1) {
    return 'very close';
  } else if (distanceKm < 1) {
    return 'less than 1 km away';
  } else if (distanceKm < 10) {
    return `about ${Math.round(distanceKm)} km away`;
  } else if (distanceKm < 100) {
    return `about ${Math.round(distanceKm / 10) * 10} km away`;
  } else {
    return `about ${Math.round(distanceKm / 50) * 50} km away`;
  }
}; 