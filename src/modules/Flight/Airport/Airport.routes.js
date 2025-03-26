import { Router } from "express";
import airportController from "./Airport.controller.js";

const airportRoutes = Router();

airportRoutes.get("/test", (req, res) => {
    res.status(200).json({ message: "Airport route working!" });
  });
  
airportRoutes.post("/", airportController.bulkCreateAirport);

airportRoutes.get("/", airportController.getAllAirports);

airportRoutes.get("/:id", airportController.getAirportById);

airportRoutes.put("/:id", airportController.updateAirport);

export default airportRoutes;
