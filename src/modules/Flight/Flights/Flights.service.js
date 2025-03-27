import ApiError from "../../../utils/ApiError.js";
import AirlineModel from "../Airline/Airline.model.js";
import AirportModel from "../Airport/Airport.model.js";
import Bookings from "../Bookings/Bookings.model.js";
import Flight from "./Flights.model.js"
import { v4 as uuidv4 } from "uuid";


const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const bulkCreateFlights = async () => {
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
    try {
      const departureAirport = await Airport.findOne({ city: departureCity });
      const destinationAirport = await Airport.findOne({ city: destinationCity });
  
      if (!departureAirport || !destinationAirport) {
        throw new Error("Departure or destination city not found");
      }
  
      const departureAirportCode = departureAirport.code;
  
      const airlines = await Airline.find({
        code: new RegExp(`-${departureAirportCode}$`),
      });
  
      const airlineIds = airlines.map((airline) => airline._id);
  
      const flights = await Flight.find({
        airline: { $in: airlineIds },
        departure: departureAirport._id,
        destination: destinationAirport._id,
        status: { $ne: "fully-booked" },
      }).populate("airline");
  
      return flights;
    } catch (error) {
      console.error("Error searching flights:", error);
      throw error;
    }
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
    return await Flight.findById(id)
      .populate({
        path: "airline",
        select: "name reviews", 
        populate: {
          path: "reviews",
          select: ["rating", "review", "createdAt"],
          populate:  {
            path: "user",
            select: ["firstName", "lastName"],
          }
        },
      })
      .populate({
        path: "departure",
        select: "city", 
      })
      .populate({
        path: "destination",
        select: "city", 
      })
      .select("flightNumber availableSchedules");
  };
  

  const getAvailableSeats = async (flightId, departureTime) => {
    // Fetch the flight and filter the schedule based on departureTime
    const flight = await Flight.findById(flightId);
    if (!flight) throw new Error("Flight not found");
  
    const schedule = flight.availableSchedules.find(
      (s) => s.departureTime === departureTime
    );
    if (!schedule) throw new Error("Schedule not found");
  
    // Get the total booked seats for this flight at this schedule
    const bookedSeats = await Bookings.aggregate([
      { $match: { flight: flight._id, status: "Confirmed" } },
      { $group: { _id: null, totalBooked: { $sum: "$seatsBooked" } } },
    ]);
  
    const totalBooked = bookedSeats.length ? bookedSeats[0].totalBooked : 0;
    const availableSeats = schedule.totalSeats - totalBooked;
  
    return availableSeats >= 0 ? availableSeats : 0;
  };
  


/**
 * Fetch available schedules for a specific flight.
 * @param {string} flightId - The ID of the flight.
 * @returns {Promise<Object[]>} - Returns an array of available schedules.
 */

const getAvailableSchedules = async (flightId) => {
  if (!flightId) {
    throw new Error("Flight ID is required");
  }

  // Fetch flight details with populated fields
  const flight = await Flight.findById(flightId)
    .populate({
      path: "airline",
      select: "name reviews",
      populate: {
        path: "reviews",
        select: ["rating", "review", "createdAt"],
        populate: {
          path: "user",
          select: ["firstName", "lastName"],
        },
      },
    })
    .populate({
      path: "departure",
      select: "city",
    })
    .populate({
      path: "destination",
      select: "city",
    })
    .select("flightNumber availableSchedules");

  if (!flight) {
    throw new Error("Flight not found");
  }

  // Fetch all bookings for this flight
  const bookings = await Booking.find({ flight: flightId })
    .select("passengerName passengerEmail seatsBooked selectedSeats status isJetShare")
    .lean();

  // Map available schedules and include booking details
  const availableSchedules = flight.availableSchedules
    .map((schedule, index) => {
      const scheduleBookings = bookings.filter(booking => booking.scheduleIndex === index);

      return {
        scheduleIndex: index,
        departureTime: schedule.departureTime,
        arrivalTime: schedule.arrivalTime,
        totalSeats: schedule.totalSeats,
        availableSeats: schedule.availableSeats.length,
        jetShare: schedule.jetShare,
        maxPassengersPerJetShare: schedule.maxPassengersPerJetShare,
        additionalCharge: schedule.additionalCharge,
        bookings: scheduleBookings, // Include related bookings
      };
    })
    .filter(schedule => schedule.availableSeats > 0);

  return {
    flightId: flight._id,
    flightNumber: flight.flightNumber,
    airline: flight.airline,
    departureCity: flight.departure.city,
    destinationCity: flight.destination.city,
    availableSchedules,
  };
};



export default {
    bulkCreateFlights,
  getAllFlights,
  searchFlights,
  getFlightById,
  getAvailableSeats,
  getAvailableSchedules,
};
