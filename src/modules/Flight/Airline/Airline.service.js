import httpStatus from "http-status"
import Airline from "./Airline.model.js"
import ApiError from "../../../utils/ApiError.js";
import Airport from "../Airport/Airport.model.js";

/**
 * Create a new airline
 * @param {Object} airlineData
 * @returns {Promise<Airline>}
 */

const airlineNames = [
  "Air Peace",
  "Arik Air",
  "Dana Air",
  "Ibom Air",
  "Green Africa Airways",
  "United Nigeria Airlines",
  "Max Air",
  "Overland Airways"
];

const getRandomAirlines = () => {
  const shuffled = airlineNames.sort(() => 0.5 - Math.random()); 
  return shuffled.slice(0, 4); 
};
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const bulkCreateAirlines = async () => {
  const airports = await Airport.find();

  if (!airports.length) {
    throw new ApiError(httpStatus.NOT_FOUND, "No airports found");
  }

  const airlinesData = [];

  airports.forEach((airport) => {
    const selectedAirlines = getRandomAirlines(); 

    selectedAirlines.forEach((airlineName) => {
      airlinesData.push({
        name: airlineName,
        code: `${airlineName.split(" ")[0].toUpperCase()}-${airport.code}`,
        country: "Nigeria",
        airport: airport._id, 
        fleetSize: getRandomNumber(2, 10), 
      });
    });
  });

  const createdAirlines = await Airline.insertMany(airlinesData);

  for (const airline of createdAirlines) {
    await Airport.findByIdAndUpdate(airline.airport, {
      $push: { airlines: airline._id },
    });
  }

  console.log("Airlines created successfully:", createdAirlines);
  return createdAirlines;
};

/**
 * Get all airlines
 * @returns {Promise<Array<Airline>>}
 */
const getAllAirlines = async () => {
  return await Airline.find().sort({ name: 1 }); // Sort alphabetically
};

/**
 * Get an airline by ID
 * @param {String} airlineId
 * @returns {Promise<Airline>}
 */
const getAirlineById = async (airlineId) => {
  const airline = await Airline.findById(airlineId);
  if (!airline) {
    throw new ApiError(httpStatus.NOT_FOUND, "Airline not found");
  }
  return airline;
};

/**
 * Update an airline by ID
 * @param {String} airlineId
 * @param {Object} updateData
 * @returns {Promise<Airline>}
 */
const updateAirline = async (airlineId, updateData) => {
  const airline = await Airline.findByIdAndUpdate(airlineId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!airline) {
    throw new ApiError(httpStatus.NOT_FOUND, "Airline not found");
  }

  return airline;
};

/**
 * Delete an airline by ID
 * @param {String} airlineId
 * @returns {Promise<void>}
 */
const deleteAirline = async (airlineId) => {
  const airline = await Airline.findByIdAndDelete(airlineId);
  if (!airline) {
    throw new ApiError(httpStatus.NOT_FOUND, "Airline not found");
  }
};

export default {
  bulkCreateAirlines,
  getAllAirlines,
  getAirlineById,
  updateAirline,
  deleteAirline,
};
