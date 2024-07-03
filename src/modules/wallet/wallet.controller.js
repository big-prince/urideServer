import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync.js";
import Logger from "../../config/logger.js";
import ApiError from "../../utils/ApiError.js";
import Response from "../../utils/utils.js";
import walletService from "./wallet.service.js";

//paystackcallback
export const paystackCallback = catchAsync(async (req, res) => {
  const result = await walletService.paystackCallback(req.body);
  if (result == null) {
    return Response.error(res, httpStatus.BAD_REQUEST, "Invalid request");
  }
  return Response.success(res, httpStatus.OK, result, "Success");
});

//initialize payment
export const initializePayment = catchAsync(async (req, res) => {
  try {
    // Await the initialization result from the service
    const result = await walletService.initializePayment(req.body);

    // Check for successful initialization
    if (!result) {
      return Response.sendErrResponse(
        res,
        httpStatus.BAD_REQUEST,
        "Invalid request"
      );
    }

    // Send success response with the authorization URL (assuming it's in result)
    return Response.sendSuccessResponse(res, httpStatus.OK, result);
  } catch (error) {
    console.log(error);
    // Handle any errors during initialization
    return Response.sendErrResponse(
      res,
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to initialize payment"
    );
  }
});

//payment verification
const paymentVerification = catchAsync(async (req, res) => {
  console.log(req.body);
  const response = await walletService.intitializePayment(req.body);
});
export default {
  paystackCallback,
  initializePayment,
  paymentVerification,
};
