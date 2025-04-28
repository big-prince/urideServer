import axios from "axios";
import Logger from "../config/logger.js";

const mapboxToken =
  "pk.eyJ1IjoibWFpbmx5cHJpbmNlIiwiYSI6ImNtOGFybW5mczFrcHgyeHNjMjcwd2RvcjAifQ.JHfSF2uqZjJjaDLaSsLJqA";

const getCordinates = async (location) => {
  if (!location || typeof location !== 'string') {
    Logger.error("Invalid location provided to geocoder");
    throw new Error("Invalid location provided");
  }

  try {
    // Add proper parameters for more accurate results
    const response = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        location
      )}.json`,
      {
        params: {
          access_token: mapboxToken,
          limit: 1, // Limit to one result
          types: "address,place,locality,neighborhood", // Focus on places and addresses
          language: "en"
        },
      }
    );

    // Check if we got valid results
    if (!response.data.features || response.data.features.length === 0) {
      Logger.error(`No geocoding results found for: ${location}`);
      throw new Error(`Could not find coordinates for: ${location}`);
    }

    const coordinates = response.data.features[0].geometry.coordinates;
    Logger.info(`Geocoded "${location}" to: [${coordinates[1]}, ${coordinates[0]}]`);

    // Return the exact location name provided by the frontend instead of Mapbox's place_name
    return {
      lat: coordinates[1],
      lng: coordinates[0],
      placeName: location // Use the original location string instead of response.data.features[0].place_name
    };
  } catch (error) {
    Logger.error(`Error in Geocode API for location "${location}": ${error.message}`);
    if (error.response) {
      Logger.error(`API response error: ${JSON.stringify(error.response.data)}`);
    }
    throw new Error(`Failed to geocode location: ${location}`);
  }
};

/**
 * Extract standardized coordinates from various possible formats
 * @param {Object|Array} coords - Coordinates in various possible formats
 * @returns {Object} Standardized { lat, lng } object
 */
export function normalizeCoordinates(coords) {
  if (!coords) {
    throw new Error("Invalid coordinates provided");
  }

  // If it's already in our standard format
  if (coords.lat !== undefined && (coords.lng !== undefined || coords.lon !== undefined)) {
    return {
      lat: coords.lat,
      lng: coords.lng || coords.lon
    };
  }

  // If it's in GeoJSON Point format [lng, lat]
  if (Array.isArray(coords) && coords.length >= 2) {
    // GeoJSON uses [longitude, latitude] order
    return {
      lat: coords[1],
      lng: coords[0]
    };
  }

  // If it's in MongoDB coordinates format with type and coordinates
  if (coords.type === 'Point' && Array.isArray(coords.coordinates) && coords.coordinates.length >= 2) {
    return {
      lat: coords.coordinates[1],
      lng: coords.coordinates[0]
    };
  }

  throw new Error("Couldn't normalize coordinates: unknown format");
}

export default getCordinates;
