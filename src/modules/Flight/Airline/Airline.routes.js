import { Router } from "express";
import airlineController from "./Airline.controller.js";

const airlineRoutes = Router();

airlineRoutes.post("/", airlineController.bulkCreateAirlines);

airlineRoutes.get("/", airlineController.getAllAirlines);

airlineRoutes.get("/:id", airlineController.getAirlineById);

airlineRoutes.put("/:id", airlineController.updateAirline);

export default airlineRoutes;
