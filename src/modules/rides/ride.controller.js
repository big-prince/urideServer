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

const addRider = catchAsync(async (req, res) => {
  const result = await rideService.addRider(req.body);
  if (result === null) {
    Response.sendErrResponse(res, httpStatus.NOT_FOUND, result);
  } else {
    Response.sendSuccessResponse(res, httpStatus.OK, result);
  }
});

const requestToDriver = catchAsync(async (req, res) => {
  const details = req.body;
  const result = await rideService.requestToDriver(details);
  if (result === null) {
    Response.sendErrResponse(res, httpStatus.NOT_FOUND, result);
  } else {
    Response.sendSuccessResponse(res, httpStatus.OK, result);
  }
});

const startRide = catchAsync(async (req, res) => {
  const result = await rideService.startRide(req.body);
  if (result === null) {
    Response.sendErrResponse(res, httpStatus.NOT_FOUND, result);
  } else {
    Response.sendSuccessResponse(res, httpStatus.OK, result);
  }
});

const waitingList = catchAsync(async (req, res) => {
  const result = await rideService.getWaitingList(req);
  if (result === null) {
    Response.sendErrResponse(res, httpStatus.NOT_FOUND, result);
  } else {
    Response.sendSuccessResponse(res, httpStatus.OK, result);
  }
});

//delete user from waiting list
const deleteWaitingList = catchAsync(async (req, res) => {
  const result = await rideService.deleteWaitingList(req.body);
  if (result === null) {
    Response.sendErrResponse(res, httpStatus.NOT_FOUND, result);
  } else {
    Response.sendSuccessResponse(res, httpStatus.OK, result);
  }
});

//veridy security code
const verifySecurityCode = catchAsync(async (req, res) => {
  const result = await rideService.verifySecurityCode(req.body);
  if (result === null) {
    Response.sendErrResponse(res, httpStatus.NOT_FOUND, result);
  } else {
    Response.sendSuccessResponse(res, httpStatus.OK, result);
  }
});

//end ride
const endRide = catchAsync(async (req, res) => {
  const result = await rideService.endRide(req.body);
  if (result === null) {
    Response.sendErrResponse(res, httpStatus.NOT_FOUND, result);
  } else {
    Response.sendSuccessResponse(res, httpStatus.OK, result);
  }
});

//test code
const test = catchAsync(async (req, res) => {
  const result = await rideService.testCode(req.body);
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
  addRider,
  requestToDriver,
  startRide,
  waitingList,
  deleteWaitingList,
  verifySecurityCode,
  endRide,
  test,
};
