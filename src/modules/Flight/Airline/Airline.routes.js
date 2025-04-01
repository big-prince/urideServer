import { Router } from "express";
import routeLogger from "../../../middlewares/route.js";
import airlineController from "./Airline.controller.js";

const airlineRoutes = Router();

airlineRoutes.post("/", routeLogger, airlineController.bulkCreateAirlines);

airlineRoutes.get("/", routeLogger, airlineController.getAllAirlines);

airlineRoutes.get("/:id", routeLogger, airlineController.getAirlineById);

airlineRoutes.put("/:id", routeLogger, airlineController.updateAirline);

export default airlineRoutes;
