import ApiError from "../../../utils/ApiError.js";
import AirlineModel from "../Airline/Airline.model.js";
import AirportModel from "../Airport/Airport.model.js";
import Bookings from "../Bookings/Bookings.model.js";
import Flight from "./Flights.model.js";
import httpStatus from "http-status";
import { v4 as uuidv4 } from "uuid";

const getRandomNumber = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const bulkCreateFlights = async () => {
  try {
    await Flight.deleteMany({});
    console.log("Existing Flights removed");

    const airlines = await AirlineModel.find();
    const airports = await AirportModel.find();

    if (!airlines.length) {
      console.error("No airlines found!");
      return;
    }

    if (airports.length < 2) {
      console.error("Not enough airports available!");
      return;
    }

    const flightsData = [];

    airlines.forEach((airline) => {
      const departureIndex = getRandomNumber(0, airports.length - 1);
      let destinationIndex;

      do {
        destinationIndex = getRandomNumber(0, airports.length - 1);
      } while (destinationIndex === departureIndex); // Prevent duplicate departure/destination

      const departure = airports[departureIndex];
      const destination = airports[destinationIndex];

      const distanceKm = getRandomNumber(200, 2000);
      const pricePerKm = getRandomNumber(50, 300);
      const basePrice = distanceKm * pricePerKm;

      flightsData.push({
        airline: airline._id,
        flightNumber: uuidv4().slice(0, 8).toUpperCase(),
        departure: departure._id,
        destination: destination._id,
        fixedPrice: basePrice,
        status: "open",
        availableSchedules: [
          {
            departureTime: "10:00 AM",
            arrivalTime: "02:00 PM",
            totalSeats: 8,
            availableSeats: ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B"],
            additionalCharge: 5000,
            jetShare: false,
          },
          {
            departureTime: "04:00 PM",
            arrivalTime: "06:00 PM",
            totalSeats: 8,
            availableSeats: ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B"],
            additionalCharge: 5000,
            jetShare: false,
          },
        ],
      });
    });

    if (!flightsData.length) {
      console.error("No flights were created!");
      return;
    }

    const createdFlights = await Flight.insertMany(flightsData);
    console.log(`${createdFlights.length} flights added successfully!`);
    return createdFlights;
  } catch (error) {
    console.error("Error creating flights:", error);
    throw error;
  }
};

const searchFlights = async (departureCity, destinationCity) => {
  try {
    // Find the departure airport (by city or code)
    const departureAirport = await AirportModel.findOne({
      $or: [{ city: departureCity }, { code: departureCity }],
    });

    // Find the destination airport (by city or code)
    const destinationAirport = await AirportModel.findOne({
      $or: [{ city: destinationCity }, { code: destinationCity }],
    });

    // If either airport is not found, return an error
    if (!departureAirport || !destinationAirport) {
      console.error("🚨 Airport not found:", {
        departureCity,
        destinationCity,
        foundDeparture: departureAirport,
        foundDestination: destinationAirport,
      });

      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Departure or destination city not found"
      );
    }

    console.log("✅ Found Airports:", {
      departure: departureAirport.code,
      destination: destinationAirport.code,
    });

    // Find flights with proper filtering
    const flights = await Flight.find({
      departure: departureAirport._id,
      destination: destinationAirport._id,
      $or: [{ status: { $ne: "fully-booked" } }, { "availableSchedules.jetShare": true }],
    })
      .populate("airline", "name code country fleetSize logo image")
      .populate("departure", "name code city country type")
      .populate("destination", "name code city country type");

    if (!flights.length) {
      throw new ApiError(httpStatus.NOT_FOUND, "No flights available for this route");
    }

    console.log("✈️ Found Flights:", flights.length, "flights available");

    return flights;
  } catch (error) {
    console.error("❌ Error searching flights:", error.message);
    throw error;
    // throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to search flights");
  }
};

/**
 * Get all flights
 */
const getAllFlights = async () => {
  try {
    const flights = await Flight.find()
      .populate({
        path: "airline",
        select: "name code country fleetSize logo",
      })
      .populate({
        path: "departure",
        select: "name code city country type",
      })
      .populate({
        path: "destination",
        select: "name code city country type",
      });

    return flights;
  } catch (error) {
    console.error("Error fetching flights:", error);
    throw error;
  }
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
    .select(
      "passengerName passengerEmail seatsBooked selectedSeats status isJetShare"
    )
    .lean();

  // Map available schedules and include booking details
  const availableSchedules = flight.availableSchedules
    .map((schedule, index) => {
      const scheduleBookings = bookings.filter(
        (booking) => booking.scheduleIndex === index
      );

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
    .filter((schedule) => schedule.availableSeats > 0);

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
