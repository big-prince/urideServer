import axios from "axios";

const mapboxToken =
  "pk.eyJ1IjoibWFpbmx5cHJpbmNlIiwiYSI6ImNtOGFybW5mczFrcHgyeHNjMjcwd2RvcjAifQ.JHfSF2uqZjJjaDLaSsLJqA";

const getCordinates = async (location) => {
  try {
    const response = await axios
      .get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          location
        )}.json`,
        {
          params: {
            access_token: mapboxToken,
          },
        }
      )
      .catch((error) => {
        console.error("Error in Geocode API:", error);
      });
    const coordinates = response.data.features[0].geometry.coordinates;
    console.log("Coordinates:", coordinates);
    return {
      lat: coordinates[1],
      lng: coordinates[0],
    };
  } catch (error) {
    console.error("Error in Geocode API:", error);
  }
};

export default getCordinates;
