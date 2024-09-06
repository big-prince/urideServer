import axios from "axios";

// Replace with your actual Google Maps API key
const googleMapsApiKey = "AIzaSyB9XjWemCW4CDheEaMYdH7nqbTVkja3MMg";

const getCoordinates = async (location) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json`,
      {
        params: {
          address: location,
          key: googleMapsApiKey,
        },
      }
    );

    if (response.data.status === "OK") {
      const coordinates = response.data.results[0].geometry.location; // { lat: value, lng: value }
      return {
        lat: coordinates.lat,
        lng: coordinates.lng,
      };
    } else {
      console.error("Geocoding failed:", response.data.status);
      return null;
    }
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

export default getCoordinates;
