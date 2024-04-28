import { Router } from "express";
import auth from "../../middlewares/auth.js";
import validate from "../../middlewares/validate.js";
// import {
// 	createUser,
// 	getUsers,
// 	getUser,
// 	updateUser,
// 	deleteUser,
// } from "../../validations/user.validation.js";
// import userController from "./user.controller.js";

const router = Router();

router.post("/update_location")
router.post("/book_ride")
router.post("/booking_detail")
router.post("/ride_request_accept")
router.post("/ride_request_decline")
router.post("/driver_cancel_ride")
router.post("/passenger_cancel_ride")
router.post("/passenger_cancel_ride_force")
router.post("/driver_wait_user")
router.post("/ride_start")
router.post("/ride_stop")

export default router;
