import ApiError from "@/utils/ApiError.js";
import AirlineModel from "../Airline/Airline.model.js";
import AirportModel from "../Airport/Airport.model.js";
import Flight from "./Flights.model.js"
import { v4 as uuidv4 } from "uuid";


const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export const bulkCreateFlights = async () => {
  const airlines = await AirlineModel.find();
  const airports = await AirportModel.find();

  if (!airlines.length || airports.length < 2) {
    throw new Error("Not enough airlines or airports available to create flights");
  }

  const flightsData = [];

  airlines.forEach((airline) => {
    const departure = airports[getRandomNumber(0, airports.length - 1)];
    let destination;

    do {
      destination = airports[getRandomNumber(0, airports.length - 1)];
    } while (destination._id.equals(departure._id));

    const distanceKm = getRandomNumber(200, 2000);
    const pricePerKm = getRandomNumber(50, 300); 
    const basePrice = distanceKm * pricePerKm; 

    flightsData.push({
      airline: airline._id,
      flightNumber: uuidv4().slice(0, 8).toUpperCase(),
      departure: departure._id,
      destination: destination._id,
      pricePerKm,
      distanceKm,
      basePrice,
    });
  });

  const createdFlights = await Flight.insertMany(flightsData);
  return createdFlights;
};


const searchFlights = async (departureCity, destinationCity) => {
      const departureAirport = await AirportModel.findOne({ city: departureCity });
      const destinationAirport = await AirportModel.findOne({ city: destinationCity });
  
      if (!departureAirport || !destinationAirport) {
        throw new ApiError("Departure or destination city not found");
      }
  
      const flights = await Flight.find({
        departure: departureAirport._id,
        destination: destinationAirport._id,
        status: { $ne: "fully-booked" },
      }).populate("airline");
  
      return flights;
  };
  
/**
 * Get all flights
 */
const getAllFlights = async () => {
  return await Flight.find().populate("airline departure destination");
};

/**
 * Get a flight by ID
 * @param {string} id
 */
const getFlightById = async (id) => {
  return await Flight.findById(id).populate("airline departure destination");
};

/**
 * Update a flight by ID
 * @param {string} id
 * @param {Object} updateBody
 */
const updateFlight = async (id, updateBody) => {
  return await Flight.findByIdAndUpdate(id, updateBody, { new: true, runValidators: true });
};

/**
 * Delete a flight by ID
 * @param {string} id
 */
const deleteFlight = async (id) => {
  return await Flight.findByIdAndDelete(id);
};

export default {
    bulkCreateFlights,
  getAllFlights,
  getFlightById,
  updateFlight,
  deleteFlight,
};
