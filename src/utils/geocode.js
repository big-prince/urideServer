import axios from "axios";

const mapboxToken =
  "pk.eyJ1IjoibWFpbmx5cHJpbmNlIiwiYSI6ImNsd3l6NnlqYTAyOHMycHF1ZW05eW5nbTAifQ.cjhrRXM6D-Cm9Ivk-NrOlg";

const getCordinates = async (location) => {
  try {
    const response = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        location
      )}.json`,
      {
        params: {
          access_token: mapboxToken,
        },
      }
    );
    const coordinates = response.data.features[0].geometry.coordinates;
    return coordinates;
  } catch (error) {
    console.error("Error:", error);
  }
};

export default getCordinates;
