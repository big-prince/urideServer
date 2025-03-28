import { Router } from "express";
// import validate from "../../middlewares/validate.js";
import rideController from "./ride.controller.js";
// import validator from "../../validations/rides.validation.js";
import formatDepartureTime from "../../utils/convert.date.js";
import Logged from "../../middlewares/logged.js";
import routeLogger from "../../middlewares/route.js";
const router = Router();

router.post("/book_ride", routeLogger, rideController.bookRide);

//Post for all rides
router.post("/allrides", routeLogger, rideController.allRides);

//return all driver rides for manage ride
router.post("/driver_rides", routeLogger, rideController.driverRides);

//delete ride
router.post("/delete_ride", routeLogger, rideController.deleteRide);

//remove rider from ride
router.post("/remove_rider", routeLogger, rideController.removeRider);

//add rider to ride
router.post("/add_rider", routeLogger, rideController.addRider);

//request to driver
router.post("/request_ride", routeLogger, rideController.requestToDriver);

//start ride
router.post("/start_ride", routeLogger, rideController.startRide);

//get waiting list
router.get("/waiting_list", routeLogger, rideController.waitingList);

//delete user from waiting list
router.post("/delete_waiting", routeLogger, rideController.deleteWaitingList);

//verify security code
router.post("/verify_code", routeLogger, rideController.verifySecurityCode);

//end ride
router.post("/end_ride", routeLogger, rideController.endRide);

//test code
router.post("/test", routeLogger, rideController.test);

//test distance
router.post("/test_distance", routeLogger, rideController.testDistance);

//get user ride
router.get("/user_ride", routeLogger, rideController.getUserRide);

//ride expire checker
router.get("/ride_cleaner", routeLogger, rideController.rideCleaner);

//clear records
router.get("/delete_records", routeLogger, rideController.deleteRecords);

//get ride status
router.get("/ride_status", routeLogger, rideController.rideStatus);

export default router;
