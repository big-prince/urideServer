import axios from "axios";
import Logger from "../config/logger.js";

// Alternative API token in case the current one is rate-limited or having issues
const mapboxToken = "pk.eyJ1IjoibWFpbmx5cHJpbmNlIiwiYSI6ImNtOGFybW5mczFrcHgyeHNjMjcwd2RvcjAifQ.JHfSF2uqZjJjaDLaSsLJqA";
// OpenCage API as a backup geocoding service
const openCageApiKey = "4e2cb3816f604847855b90084772e1a7";

const getCordinates = async (location) => {
  if (!location || typeof location !== 'string') {
    Logger.error("Invalid location provided to geocoder");
    throw new Error("Invalid location provided");
  }

  try {
    // First try with Mapbox with improved parameters
    const response = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        location
      )}.json`,
      {
        params: {
          access_token: mapboxToken,
          limit: 1,
          types: "address,place,poi,locality,neighborhood", // Added POI for landmarks like airports
          country: "ng", // Restrict to Nigeria
          language: "en",
          autocomplete: false, // Get more precise results
          fuzzyMatch: false // Require more exact matches
        },
      }
    );

    // Check if we got valid results
    if (!response.data.features || response.data.features.length === 0) {
      Logger.error(`No geocoding results found for: ${location}`);
      throw new Error(`Could not find coordinates for: ${location}`);
    }

    const coordinates = response.data.features[0].geometry.coordinates;
    const relevanceScore = response.data.features[0].relevance;
    const mapboxPlaceName = response.data.features[0].place_name;

    Logger.info(`Geocoded "${location}" to: [${coordinates[1]}, ${coordinates[0]}]`);
    Logger.info(`Mapbox place name: ${mapboxPlaceName}, Relevance: ${relevanceScore}`);

    // Validation: If relevance score is poor, try with OpenCage as a backup
    if (relevanceScore < 0.8) {
      Logger.warn(`Low relevance (${relevanceScore}) for "${location}", attempting backup geocoder`);
      return await getCoordinatesWithOpenCage(location);
    }

    // Special case for known locations in Nigeria that might need direct coordinates
    const knownLocations = {
      "Nnamdi Azikiwe International Airport": { lat: 9.0065, lng: 7.2626 },
      "Wuse 2": { lat: 9.0817, lng: 7.4797 },
      "Jabi Lake Mall": { lat: 9.0764, lng: 7.4255 },
      "Transcorp Hilton Hotel": { lat: 9.0815, lng: 7.4872 }
    };

    // Check if the location contains any known location as a substring
    for (const [knownPlace, knownCoords] of Object.entries(knownLocations)) {
      if (location.toLowerCase().includes(knownPlace.toLowerCase())) {
        Logger.info(`Using hardcoded coordinates for "${knownPlace}" in "${location}"`);
        return {
          lat: knownCoords.lat,
          lng: knownCoords.lng,
          placeName: location,
          source: "hardcoded"
        };
      }
    }

    return {
      lat: coordinates[1],
      lng: coordinates[0],
      placeName: location,
      mapboxName: mapboxPlaceName,
      source: "mapbox"
    };
  } catch (error) {
    Logger.error(`Error in Mapbox Geocode API for "${location}": ${error.message}`);
    try {
      // Fallback to OpenCage API if Mapbox fails
      return await getCoordinatesWithOpenCage(location);
    } catch (backupError) {
      Logger.error(`Backup geocoder also failed: ${backupError.message}`);
      throw new Error(`Failed to geocode location: ${location}`);
    }
  }
};

// Backup geocoding service using OpenCage
async function getCoordinatesWithOpenCage(location) {
  try {
    Logger.info(`Trying backup geocoder for: ${location}`);
    const response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
      params: {
        q: location,
        key: openCageApiKey,
        countrycode: 'ng',
        limit: 1,
        no_annotations: 1
      }
    });

    if (!response.data.results || response.data.results.length === 0) {
      throw new Error('No results from backup geocoder');
    }

    const result = response.data.results[0];
    Logger.info(`Backup geocoder found: ${result.formatted} at [${result.geometry.lat}, ${result.geometry.lng}]`);

    return {
      lat: result.geometry.lat,
      lng: result.geometry.lng,
      placeName: location,
      backupName: result.formatted,
      source: "opencage"
    };
  } catch (error) {
    Logger.error(`Error in backup geocoder: ${error.message}`);
    throw error;
  }
}

/**
 * Extract standardized coordinates from various possible formats
 * @param {Object|Array} coords - Coordinates in various possible formats
 * @returns {Object} Standardized { lat, lng } object
 */
export function normalizeCoordinates(coords) {
  // Existing normalize function code...
}

export default getCordinates;
