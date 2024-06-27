import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync.js";
import rideService from "./ride.service.js";
import Logger from "../../config/logger.js";
import ApiError from "../../utils/ApiError.js";
import Response from "../../utils/utils.js";

const bookRide = catchAsync(async (req, res) => {
  const ride = await rideService.addRide(req.body);
  if (ride === null) {
    Response.sendErrResponse(res, httpStatus.NOT_FOUND, ride);
  }
  if (!ride) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Ride not available");
  }

  //if there is ride
  Response.sendSuccessResponse(res, httpStatus.OK, ride);
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
    console.log(result);
    Response.sendSuccessResponse(res, httpStatus.OK, result);
  }
});

const driverRides = catchAsync(async (req, res) => {
  const result = await rideService.driverRides(req.body);
  if (result === null) {
    Response.sendErrResponse(res, httpStatus.NOT_FOUND, result);
  } else {
    Response.sendSuccessResponse(res, httpStatus.OK, result);
  }
});

const deleteRide = catchAsync(async (req, res) => {
  const result = await rideService.deleteRide(req.body);
  if (result === null) {
    Response.sendErrResponse(res, httpStatus.NOT_FOUND, result);
  } else {
    Response.sendSuccessResponse(res, httpStatus.OK, result);
  }
});

const removeRider = catchAsync(async (req, res) => {
  const result = await rideService.removeRider(req.body);
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
  driverRides,
  deleteRide,
  removeRider,
};
