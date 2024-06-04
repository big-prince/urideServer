import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync.js";
import rideService from "./ride.service.js";
import Logger from "../../config/logger.js";
import ApiError from "../../utils/ApiError.js";
import Response from "../../utils/utils.js";

const bookRide = catchAsync(async (req, res) => {
  await rideService.addRide(req.body, function (result) {
    Logger.info(result);
    if (result === null) {
      Response.sendErrResponse(
        res,
        httpStatus.EXPECTATION_FAILED,
        "Ensure all fields are filled"
      );
    } else {
      console.log(result);
      Response.sendSuccessResponse(res, httpStatus.OK, result);
    }
  });
});

//test for all rides
const openRides = catchAsync(async (req, res) => {
  await rideService.getAllRides(function (result) {
    if (result === null) {
      Response.sendErrResponse(res, httpStatus.NOT_FOUND, result);
    } else {
      Response.sendSuccessResponse(res, httpStatus.OK, result);
    }
  });
});

const allRides = catchAsync(async (req, res) => {
  const result = await rideService.getAllOpenRidesWithLocation(req.body);
  if (result === null) {
    Response.sendErrResponse(res, httpStatus.NOT_FOUND, result);
  } else {
    Response.sendSuccessResponse(res, httpStatus.OK, result);
  }
});

export default {
  bookRide,
  allRides,
  openRides,
};
