import { Router } from "express";
import flightController  from "./Flights.controller.js";

const flightRoutes = Router();

flightRoutes.post("/", flightController.createFlight);
flightRoutes.get("/", flightController.getAllFlights);
flightRoutes.get("/:id", flightController.getFlightById);
flightRoutes.put("/:id", flightController.updateFlight);
flightRoutes.delete("/:id", flightController.deleteFlight);

export default flightRoutes;
