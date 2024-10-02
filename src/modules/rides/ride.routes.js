import { Router } from "express";
import validate from "../../middlewares/validate.js";
import rideController from "./ride.controller.js";
import validator from "../../validations/rides.validation.js";
import formatDepartureTime from "../../utils/convert.date.js";
import Logged from "../../middlewares/logged.js";
const router = Router();

router.post("/book_ride", rideController.bookRide);

//Post for all rides
router.post(
  "/allrides",
  Logged,
  validate(validator.searchRides),
  rideController.allRides
);

//return all driver rides for manage ride
router.post(
  "/driver_rides",
  Logged,
  validate(validator.driverRides),
  rideController.driverRides
);

//delete ride
router.post(
  "/delete_ride",
  Logged,
  validate(validator.deleteRide),
  rideController.deleteRide
);

//remove rider from ride
router.post(
  "/remove_rider",
  Logged,
  validate(validator.removeRider),
  rideController.removeRider
);

//add rider to ride
router.post(
  "/add_rider",
  validate(validator.addRider),
  rideController.addRider
);

//request to driver
router.post(
  "/request_ride",
  validate(validator.requestToDriver),
  rideController.requestToDriver
);

//start ride
router.post(
  "/start_ride",
  validate(validator.startRide),
  rideController.startRide
);

//get waiting list
router.get(
  "/waiting_list",
  validate(validator.getWaitingList),
  rideController.waitingList
);

//delete user from waiting list
router.post(
  "/delete_waiting",
  validate(validator.deleteWaitingList),
  rideController.deleteWaitingList
);

//verify security code
router.post(
  "/verify_code",
  validate(validator.verifySecurityCode),
  rideController.verifySecurityCode
);

//end ride
router.post("/end_ride", validate(validator.endRide), rideController.endRide);

//test code
router.post("/test", rideController.test);

//test distance
router.post("/test_distance", rideController.testDistance);

//get user ride
router.get(
  "/user_ride",
  validate(validator.userRide),
  rideController.getUserRide
);

//ride expire checker
router.get("/ride_cleaner", rideController.rideCleaner);

//clear records
router.get("/delete_records", rideController.deleteRecords);

//get ride status
router.get("/ride_status", rideController.rideStatus);

router.post("/booking_detail");
router.post("/ride_request_accept");
router.post("/ride_request_decline");
router.post("/driver_cancel_ride");
router.post("/passenger_cancel_ride");
router.post("/passenger_cancel_ride_force");
router.post("/driver_wait_user");
router.post("/ride_start");
router.post("/ride_stop");
router.post("/update_location");

export default router;
