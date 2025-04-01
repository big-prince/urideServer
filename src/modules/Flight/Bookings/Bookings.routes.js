// validate(updateUser),
import { Router } from "express";
import bookingsController from "./Bookings.controller.js";
import routeLogger from "../../../middlewares/route.js";
import { bookJet } from "../../../validations/flight.validation.js";
import validate from "../../../middlewares/validate.js";
import auth from "../../../middlewares/logged.js";

const bookingsRoutes = Router();

bookingsRoutes.post("/:flightId/book-jet", auth, routeLogger, validate(bookJet), bookingsController.bookJet);

// bookingsRoutes.post("/book-jet-share", routeLogger, bookingsController.bookJetShareSeat);

bookingsRoutes.get("/:bookingId", routeLogger, bookingsController.getBooking);


export default bookingsRoutes;
