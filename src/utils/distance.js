import Logger from "../config/logger.js";

/**
 * Calculate the great-circle distance between two points 
 * using the Haversine formula
 * @param {number} lat1 - Latitude of first point in degrees
 * @param {number} lon1 - Longitude of first point in degrees
 * @param {number} lat2 - Latitude of second point in degrees
 * @param {number} lon2 - Longitude of second point in degrees
 * @returns {number} Distance between points in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  try {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance; // Returns distance in kilometers
  } catch (error) {
    Logger.error(`Error calculating distance: ${error.message}`);
    return Infinity; // Return infinity on error, so it won't match in filters
  }
}

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
export function toRadians(degrees) {
  return degrees * Math.PI / 180;
}

/**
 * Check if two locations are within the specified radius of each other
 * @param {Object} loc1 - First location with lat and lng properties
 * @param {Object} loc2 - Second location with lat and lng properties
 * @param {number} radiusKm - Radius in kilometers
 * @returns {boolean} True if locations are within radius
 */
export function isWithinRadius(loc1, loc2, radiusKm = 5) {
  if (!loc1 || !loc2 || !loc1.lat || !loc1.lng || !loc2.lat || !loc2.lng) {
    return false;
  }

  const distance = calculateDistance(loc1.lat, loc1.lng, loc2.lat, loc2.lng);
  return distance <= radiusKm;
}

export default {
  calculateDistance,
  toRadians,
  isWithinRadius
};
