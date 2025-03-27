import { Router } from "express";
import flightController from "./Flights.controller.js";

const flightRoutes = Router();

flightRoutes.post("/", flightController.createFlight);
flightRoutes.get("/", flightController.getAllFlights);
flightRoutes.post("/search-flights", flightController.findAvailableFlights);
flightRoutes.get("/:id", flightController.getFlightById);
flightRoutes.get("/:flightId", flightController.getAvailableSeats);

export default flightRoutes;
