import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync.js';
import rideService from "./ride.service.js";
import Logger from "../../config/logger.js";
import ApiError from "../../utils/ApiError.js";

const bookRide = catchAsync(async (req, res) => {
    await rideService.addRide(req.body, function (result){
        if (result instanceof Error) {
            Logger.info("Result :: " + result);
            throw new ApiError(httpStatus.EXPECTATION_FAILED, result);
            res.status(httpStatus.EXPECTATION_FAILED, result).send();
        }
    });
    // res.status(httpStatus.CREATED).send();
})

export default {
    bookRide
}