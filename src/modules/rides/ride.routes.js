import { Router } from "express";
import auth from "../../middlewares/auth.js";
import validate from "../../middlewares/validate.js";
import rideController from "./ride.controller.js"

const router = Router();

/**
 * POST /api/v1/rides
 * @summary This Creates a ride
 * @tags Rides
 * @param {Rides} request.body.required - ride info
 * @return {Rides} 200 - Rides response
 */
router.post("/book_ride", rideController.bookRide);

router.get("/open", rideController.allRides)

router.post("/booking_detail")
router.post("/ride_request_accept")
router.post("/ride_request_decline")
router.post("/driver_cancel_ride")
router.post("/passenger_cancel_ride")
router.post("/passenger_cancel_ride_force")
router.post("/driver_wait_user")
router.post("/ride_start")
router.post("/ride_stop")
router.post("/update_location")

export default router;
