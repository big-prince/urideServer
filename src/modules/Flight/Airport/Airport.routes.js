import { Router } from "express";
import airportController from "./Airport.controller.js";
import routeLogger from "../../../middlewares/route.js";

const airportRoutes = Router();

airportRoutes.get("/test", (req, res) => {
  res.status(200).json({ message: "Airport route working!" });
});

airportRoutes.post("/", routeLogger, airportController.bulkCreateAirport);

airportRoutes.get("/", routeLogger, airportController.getAllAirports);

airportRoutes.get("/:id", routeLogger, airportController.getAirportById);

airportRoutes.put("/:id", routeLogger, airportController.updateAirport);

export default airportRoutes;
