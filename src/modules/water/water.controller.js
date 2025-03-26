import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync.js";
//services
import waterService from "./water.service.js";
//utils
import customError from "../../utils/customError.js";
import Response from "../../utils/utils.js";

//FUNCTIONS
//send Order
const sendOrder = catchAsync(async (req, res, next) => {
  try {
    const send = await waterService.sendOrder(req.body);
    if (!send) {
      return next(new customError("Order not sent", httpStatus.BAD_REQUEST));
    }
    Response.sendSuccessResponse(res, 200, send);
  } catch (e) {
    console.log(e);
    if (e instanceof customError) {
      Response.sendErrResponse(res, e.statusCode, e);
    }
    Response.sendErrResponse(res, httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

//send coupon
const sendCoupon = catchAsync(async (req, res, next) => {
  try {
    const coupon = await waterService.sendCoupon(req.body);
    if (!coupon) {
      return next(new customError("Coupon not sent", httpStatus.BAD_REQUEST));
    }
    Response.sendSuccessResponse(res, 200, coupon);
  } catch (e) {
    console.log(e);
    if (e instanceof customError) {
      Response.sendErrResponse(res, e.statusCode, e);
    }
    Response.sendErrResponse(res, httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

export default { sendOrder, sendCoupon };
