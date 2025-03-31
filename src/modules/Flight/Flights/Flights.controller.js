import httpStatus from "http-status";
import flightService from "./Flights.service.js";

/**
 * Create a new flight
 */
const createFlight = async (req, res) => {
  try {
    const flight = await flightService.bulkCreateFlights();
    res.status(httpStatus.CREATED).json(flight);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ message: error.message });
  }
};

/**
 * Get all flights
 */
const getAllFlights = async (req, res) => {
  try {
    const flights = await flightService.getAllFlights();
    res.status(httpStatus.OK).json(flights);
  } catch (error) {
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

const findAvailableFlights = async (req, res, next) => {
  try {
    const { departureCity, destinationCity } = req.body;
    const flights = await flightService.searchFlights(
      departureCity,
      destinationCity
    );
    res.status(httpStatus.OK).json(flights);
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single flight by ID
 */
const getFlightById = async (req, res) => {
  try {
    const flight = await flightService.getFlightById(req.params.id);
    if (!flight) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "Flight not found" });
    }
    res.status(httpStatus.OK).json(flight);
  } catch (error) {
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

/**
 * Get Available Seats
 */
const getAvailableSeats = async (req, res) => {
  try {
    const flightId = req.params.flightId;

    const departureTime = req.query.departureTime;

    const availableSeats = await flightService.getAvailableSeats(
      flightId,
      departureTime
    );

    res.status(httpStatus.OK).json(availableSeats);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ message: error.message });
  }
};

export default {
  createFlight,
  getAllFlights,
  findAvailableFlights,
  getFlightById,
  getAvailableSeats,
};
