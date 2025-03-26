import { Router } from "express";
import flightRoutes from "./Flights/Flights.routes.js";
import airlineRoutes from "./Airline/Airline.routes.js";
import airportRoutes from "./Airport/Airport.routes.js";

const airRouter = Router();

airRouter.use("/flights", flightRoutes);
airRouter.use("/airport", airportRoutes);
airRouter.use("/airline", airlineRoutes);

export default airRouter;
