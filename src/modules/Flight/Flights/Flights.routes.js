import { Router } from "express";
import flightController from "./Flights.controller.js";
import routeLogger from "../../../middlewares/route.js";

const flightRoutes = Router();

flightRoutes.post("/", routeLogger, flightController.createFlight);
flightRoutes.get("/", routeLogger, flightController.getAllFlights);
flightRoutes.post(
  "/search-flights",
  routeLogger,
  flightController.findAvailableFlights
);
flightRoutes.get("/:id", routeLogger, flightController.getFlightById);
flightRoutes.get("/:flightId", routeLogger, flightController.getAvailableSeats);

export default flightRoutes;
