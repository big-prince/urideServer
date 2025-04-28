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

    return {
      lat: coordinates[1],
      lng: coordinates[0],
      placeName: response.data.features[0].place_name
    };
  } catch (error) {
    Logger.error(`Error in Geocode API for location "${location}": ${error.message}`);
    if (error.response) {
      Logger.error(`API response error: ${JSON.stringify(error.response.data)}`);
    }
    throw new Error(`Failed to geocode location: ${location}`);
  }
};

export default getCordinates;
