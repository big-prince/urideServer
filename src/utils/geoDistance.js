import axios from "axios";

// Replace with your actual ORS API key
const orsApiKey = "5b3ce3597851110001cf6248f739fa40679247eda22d0b4fd3a247ba";

// Function to calculate distance between two coordinates
const getDistance = async (origin, destination) => {
  console.log("Calculating distance between:", origin, destination);
  try {
    // ORS expects coordinates in [longitude, latitude] format
    const locations = [
      [origin.lng, origin.lat],
      [destination.lng, destination.lat],
    ];

    console.log("Locations:", locations);

    const response = await axios.post(
      "https://api.openrouteservice.org/v2/matrix/driving-car",
      {
        locations: locations,
        metrics: ["distance", "duration"],
      },
      {
        headers: {
          Authorization: orsApiKey,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200 && response.data) {
      const distance = response.data.distances[0][1]; // Distance in meters
      const distanceText = `${Math.round(distance / 1000)} km`; // Convert to kilometers
      console.log(`Distance: ${distanceText} (${distance} meters)`);
      return { distance, distanceText };
    } else {
      console.error("ORS API error:", response.status);
      return null;
    }
  } catch (error) {
    console.error("Error:", error.message);
    return null;
  }
};

export default getDistance;

// Example usage with coordinates for Lagos and Ibadan
// const origin = { lat: 6.5244, lng: 3.3792 }; // Lagos, Nigeria
// const destination = { lat: 7.3775, lng: 3.947 }; // Ibadan, Nigeria
// getDistance(origin, destination).then((result) =>
//   console.log("Result:", result)
// );
