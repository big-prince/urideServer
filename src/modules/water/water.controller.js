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
    const send = await waterService.sendOrder(req.body, req.id);
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
    const coupon = await waterService.sendCoupon(req.body, req.id);
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

//get OrderFrom
const getOrderFrom = catchAsync(async (req, res, next) => {
  try {
    const order = await waterService.getOrderFrom(req.id);
    if (!order) {
      return next(new customError("Order not found", httpStatus.BAD_REQUEST));
    }
    Response.sendSuccessResponse(res, 200, order);
  } catch (e) {
    console.log(e);
    if (e instanceof customError) {
      Response.sendErrResponse(res, e.statusCode, e);
    }
    Response.sendErrResponse(res, httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

//get all users orders
const getAllOrders = catchAsync(async (req, res, next) => {
  try {
    const orders = await waterService.getOrders(req.id);
    if (!orders) {
      return next(new customError("Orders not found", httpStatus.BAD_REQUEST));
    }
    Response.sendSuccessResponse(res, 200, orders);
  } catch (e) {
    console.log(e);
    if (e instanceof customError) {
      Response.sendErrResponse(res, e.statusCode, e);
    }
    Response.sendErrResponse(res, httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

//get all orderTO
const getOrderTo = catchAsync(async (req, res, next) => {
  try {
    const orders = await waterService.getOrderTo(req.id);
    if (!orders) {
      return next(new customError("Orders not found", httpStatus.BAD_REQUEST));
    }
    Response.sendSuccessResponse(res, 200, orders);
  } catch (e) {
    console.log(e);
    if (e instanceof customError) {
      Response.sendErrResponse(res, e.statusCode, e);
    }
    Response.sendErrResponse(res, httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

//get order by id
const getOrderById = catchAsync(async (req, res, next) => {
  try {
    const order = await waterService.getOrder(req.params.id);
    if (!order) {
      return next(new customError("Order not found", httpStatus.BAD_REQUEST));
    }
    Response.sendSuccessResponse(res, 200, order);
  } catch (e) {
    console.log(e);
    if (e instanceof customError) {
      Response.sendErrResponse(res, e.statusCode, e);
    }
    Response.sendErrResponse(res, httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

//get order cordinates
const getOrderCordinates = catchAsync(async (req, res, next) => {
  try {
    const order = await waterService.getOrderCordinates(req.params.id);
    if (!order) {
      return next(new customError("Order not found", httpStatus.BAD_REQUEST));
    }
    Response.sendSuccessResponse(res, 200, order);
  } catch (e) {
    console.log(e);
    if (e instanceof customError) {
      Response.sendErrResponse(res, e.statusCode, e);
    }
    Response.sendErrResponse(res, httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

//get water rates
const getWaterRates = catchAsync(async (req, res, next) => {
  try {
    const rates = await waterService.getWaterRates(req.params.weight);
    if (!rates) {
      return next(new customError("Rates not found", httpStatus.BAD_REQUEST));
    }
    Response.sendSuccessResponse(res, 200, rates);
  } catch (e) {
    console.log(e);
    if (e instanceof customError) {
      Response.sendErrResponse(res, e.statusCode, e);
    }
    Response.sendErrResponse(res, httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

//complete order
const completeOrder = catchAsync(async (req, res, next) => {
  try {
    const order = await waterService.completeOrder(req.body);
    if (!order) {
      return next(new customError("Order not found", httpStatus.BAD_REQUEST));
    }
    Response.sendSuccessResponse(res, 200, order);
  } catch (e) {
    console.log(e);
    if (e instanceof customError) {
      Response.sendErrResponse(res, e.statusCode, e);
    }
    Response.sendErrResponse(res, httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

//process order
const processOrder = catchAsync(async (req, res, next) => {
  try {
    const order = await waterService.processOrder(req.params.id);
    if (!order) {
      return next(new customError("Order not found", httpStatus.BAD_REQUEST));
    }
    Response.sendSuccessResponse(res, 200, order);
  } catch (e) {
    console.log(e);
    if (e instanceof customError) {
      Response.sendErrResponse(res, e.statusCode, e);
    }
    Response.sendErrResponse(res, httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

//get water rates(cost) with coupon
const getWaterRatesWithCoupons = catchAsync(async (req, res, next) => {
  try {
    const rates = await waterService.getWaterRatesWithCoupons(
      req.params.weight,
      req.params.coupon,
      req.id
    );
    if (!rates) {
      return next(new customError("Rates not found", httpStatus.BAD_REQUEST));
    }
    Response.sendSuccessResponse(res, 200, rates);
  } catch (e) {
    console.log(e);
    if (e instanceof customError) {
      Response.sendErrResponse(res, e.statusCode, e);
    }
    Response.sendErrResponse(res, httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

export default {
  sendOrder,
  sendCoupon,
  getOrderFrom,
  getAllOrders,
  getOrderTo,
  getOrderById,
  getOrderCordinates,
  getWaterRates,
  completeOrder,
  processOrder,
  getWaterRates,
  getWaterRatesWithCoupons,
};
