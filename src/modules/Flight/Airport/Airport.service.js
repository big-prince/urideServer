import httpStatus from "http-status";
import Airport from "./Airport.model.js";
import ApiError from "../../../utils/ApiError.js";

const airports = [
  {
    name: "Murtala Muhammed International Airport",
    code: "LOS",
    city: "Lagos",
    country: "Nigeria",
    type: "International",
  },
  {
    name: "Nnamdi Azikiwe International Airport",
    code: "ABV",
    city: "Abuja",
    country: "Nigeria",
    type: "International",
  },
  {
    name: "Mallam Aminu Kano International Airport",
    code: "KAN",
    city: "Kano",
    country: "Nigeria",
    type: "International",
  },
  {
    name: "Port Harcourt International Airport",
    code: "PHC",
    city: "Port Harcourt",
    country: "Nigeria",
    type: "International",
  },
  {
    name: "Akanu Ibiam International Airport",
    code: "ENU",
    city: "Enugu",
    country: "Nigeria",
    type: "International",
  },
  {
    name: "Kaduna International Airport",
    code: "KAD",
    city: "Kaduna",
    country: "Nigeria",
    type: "International",
  },
  {
    name: "Sam Mbakwe Airport",
    code: "QOW",
    city: "Owerri",
    country: "Nigeria",
    type: "Domestic",
  },
  {
    name: "Ibadan Airport",
    code: "IBA",
    city: "Ibadan",
    country: "Nigeria",
    type: "Domestic",
  },
  {
    name: "Ilorin Airport",
    code: "ILR",
    city: "Ilorin",
    country: "Nigeria",
    type: "Domestic",
  },
  {
    name: "Yola Airport",
    code: "YOL",
    city: "Yola",
    country: "Nigeria",
    type: "Domestic",
  },
];

/**
 * Create a new airport
 * @param {Object} airports
 * @returns {Promise<Airport>}
 */
export const bulkCreateAirport = async () => {
  try {
    await Airport.deleteMany({});
    console.log("Existing airports removed");

    // Bulk insert new airport data
    const insertedAirports = await Airport.insertMany(airports);
    console.log("Airports inserted successfully");

    return insertedAirports;
  } catch (error) {
    console.error("Error inserting airports:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all airports
 * @returns {Promise<Array<Airport>>}
 */
const getAllAirports = async () => {
  return await Airport.find().sort({ name: 1 });
};

/**
 * Search airports by city
 * @param {string} city - The city to search for airports
 * @returns {Promise<Object>}
 */
export const searchAirportByCity = async (city) => {
  try {
    if (!city) {
      throw new ApiError("City is required");
    }

    const airports = await Airport.find({ city: new RegExp(`^${city}$`, "i") });

    if (airports.length === 0) {
      return { success: false, message: "No airports found for this city" };
    }

    return { success: true, data: airports };
  } catch (error) {
    console.error("Error searching airports:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get an airport by ID
 * @param {String} airportId
 * @returns {Promise<Airport>}
 */
const getAirportById = async (airportId) => {
  const airport = await Airport.findById(airportId);
  if (!airport) {
    throw new ApiError(httpStatus.NOT_FOUND, "Airport not found");
  }
  return airport;
};

/**
 * Update an airport by ID
 * @param {String} airportId
 * @param {Object} updateData
 * @returns {Promise<Airport>}
 */
const updateAirport = async (airportId, updateData) => {
  const airport = await Airport.findByIdAndUpdate(airportId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!airport) {
    throw new ApiError(httpStatus.NOT_FOUND, "Airport not found");
  }

  return airport;
};

/**
 * Delete an airport by ID
 * @param {String} airportId
 * @returns {Promise<void>}
 */
const deleteAirport = async (airportId) => {
  const airport = await Airport.findByIdAndDelete(airportId);
  if (!airport) {
    throw new ApiError(httpStatus.NOT_FOUND, "Airport not found");
  }
};

export default {
  bulkCreateAirport,
  getAllAirports,
  getAirportById,
  updateAirport,
  deleteAirport,
};
