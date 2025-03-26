import httpStatus from "http-status"
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
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

/**
 * Get a single flight by ID
 */
const getFlightById = async (req, res) => {
  try {
    const flight = await flightService.getFlightById(req.params.id);
    if (!flight) {
      return res.status(httpStatus.NOT_FOUND).json({ message: "Flight not found" });
    }
    res.status(httpStatus.OK).json(flight);
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

/**
 * Update a flight
 */
const updateFlight = async (req, res) => {
  try {
    const flight = await flightService.updateFlight(req.params.id, req.body);
    if (!flight) {
      return res.status(httpStatus.NOT_FOUND).json({ message: "Flight not found" });
    }
    res.status(httpStatus.OK).json(flight);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ message: error.message });
  }
};

/**
 * Delete a flight
 */
const deleteFlight = async (req, res) => {
  try {
    const flight = await flightService.deleteFlight(req.params.id);
    if (!flight) {
      return res.status(httpStatus.NOT_FOUND).json({ message: "Flight not found" });
    }
    res.status(httpStatus.NO_CONTENT).send();
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

export default {
  createFlight,
  getAllFlights,
  getFlightById,
  updateFlight,
  deleteFlight,
};
