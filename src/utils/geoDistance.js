import axios from "axios";
import Logger from "../config/logger.js";

// Replace with your actual Google Maps API key
const googleMapsApiKey = "AIzaSyB9XjWemCW4CDheEaMYdH7nqbTVkja3MMg";

// Function to get the distance between two places
const getDistance = async (origin, destination) => {
  try {
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/distancematrix/json",
      {
        params: {
          origins: origin, // Start location (can be an address or coordinates)
          destinations: destination, // End location (can be an address or coordinates)
          key: googleMapsApiKey, // Your API key
        },
      }
    );

    // Check if the API response is OK
    if (response.data.status === "OK") {
      Logger.info(
        "🚀 ~ getDistance ~ response.data.status:",
        response.data.status
      );
      Logger.info("API response is OK");
      const element = response.data.rows[0].elements[0];

      if (element.status === "OK") {
        Logger.info("🚀 ~ getDistance ~ element.status:", element.status);

        // Distance in meters and human-readable distance
        const distance = element.distance.value; // Distance in meters
        const distanceText = element.distance.text; // Human-readable text (e.g., "13 km")

        Logger.info(`Distance: ${distanceText} (${distance} meters)`);
        return {
          distance: distance, // distance in meters
          distanceText: distanceText, // readable distance
        };
      } else {
        console.error("Error:", element.status);
        return null;
      }
    } else {
      console.error("Error:", response.data.status);
      return null;
    }
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

export default getDistance;
