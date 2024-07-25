//import Logger
import Logger from "../config/logger.js";
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function haversineDistance(coord1, coord2) {
  try {
    const R = 6371; // Radius of the Earth in kilometers

    const lat1 = toRadians(coord1.lat);
    const lon1 = toRadians(coord1.lon);
    const lat2 = toRadians(coord2.lat);
    const lon2 = toRadians(coord2.lon);

    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // Distance in kilometers

    return distance;
  } catch (error) {
    Logger.info({
      message: error.message,
      stack: error.stack,
      status: "Error in Geo-Distance",
    });
  }
}

export default haversineDistance;
