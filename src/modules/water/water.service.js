//models
import Order from "./orders.model.js";
import User from "../users/user.model.js";
import Transaction from "../wallet/transaction.models.js";
import Wallet from "../wallet/wallet.model.js";
import Coupon from "./coupons.model.js";
//utils
import {
  getCost,
  getExpressCost,
  getCostWithDiscount,
  getExpressCostWithDiscount,
  percentageDiscount,
} from "../../utils/costCalculator.js";
import {
  estimatedDeliveryDays,
  getEstimatedDelivery,
  getEstimatedDeliveryStandard,
} from "../../utils/estimatedDeliveryTime.js";
import { generateTrackingCode } from "../../utils/trackingCode.js";
import customError from "../../utils/customError.js";
//services
import {
  generateBasicDiscount,
  generateExpressDiscount,
  generatePremiumDiscount,
  basicDiscount,
  expressDiscount,
  premiumDiscount,
} from "./generateCoupon.js";
import getDistance from "../../utils/geoDistance.js";
import getCordinates from "../../utils/geocode.js";

//FUNCTIONS
const sendOrder = async (sendInfo, userId) => {
  //generate tracking code
  const trackingCode = generateTrackingCode();
  console.log("🚀 ~ sendOrder ~ trackingCode:", trackingCode);

  //generate cordinates
  let senderCordinates = await getCordinates(sendInfo.senderInfo.pickupAddress);
  let receiverCordinates = await getCordinates(
    sendInfo.receiversInfo.receiversAddress
  );
  //get Distance between them
  let distance = await getDistance(senderCordinates, receiverCordinates);
  //finalise
  let query = {
    user: userId,
    senderInfo: sendInfo.senderInfo,
    parcelInfo: sendInfo.parcelInfo,
    receiversInfo: sendInfo.receiversInfo,
    estimatedDeliveryDays: sendInfo.estimatedDeliveryDays,
    estimatedDeliveryDate: sendInfo.estimatedDeliveryDate,
    cost: {
      type: sendInfo.cost.type,
      amount: sendInfo.cost.amount,
    },
    status: "pending",
    tracking: {
      trackingNumber: trackingCode,
      distance: distance.distance,
      distanceText: distance.distanceText,
      senderCordinates: {
        lat: senderCordinates.lat,
        lng: senderCordinates.lng,
      },
      receiverCordinates: {
        lat: receiverCordinates.lat,
        lng: receiverCordinates.lng,
      },
    },
  };
  if (sendInfo.coupon) {
    query.coupon = sendInfo.coupon;
    query.couponCode = sendInfo.couponCode;
  }
  console.log(query);

  try {
    let newOrder = await Order.create(query);
    let user = await User.findOne({ _id: userId });
    if (!user) {
      throw new customError("User not found", 400).serveError();
    }
    let userOrderFrom = [...user.water.ordersFrom];
    if (userOrderFrom.includes(newOrder._id)) {
      throw new customError("Order already exists", 400).serveError();
    }
    userOrderFrom.push(newOrder._id);
    user.water.ordersFrom = userOrderFrom;
    await user.save();

    return {
      message: "Order created successfully",
      data: newOrder,
    };

    //add order to user
  } catch (e) {
    if (e instanceof customError) {
      throw customError(e.message, e.statusCode).serveError();
    }
    throw new customError(`${e.message}`, 400).serveError();
  }
};

//send coupon
//TODO: TURN THIS TO A CRON JOB TO BE CALLED EVERY 5DAYS AND RANDOMLY MAKES DIFFERENT COUPONS
//TODO: DO A CRON JOB TO GO AROUND AND DELETE EXPIRED COUPONS EVERY MIDNIGHT BY 1AM BY VALIDTO
//TODO: DO AN API TO GET ALL COUPONS AND THEIR USAGE COUNT AND VALIDITY FOR ALL USERS TO SEE IN EXPLORE PAGE
const sendCoupon = async (type, userId) => {
  let coupon;
  let maintype = type.type;
  let message;
  let assigntouser = async () => {
    //assign coupon to user
    const user = await User.findById(userId);
    if (!user) {
      throw new customError("User not found", 400).serveError();
    }
    user.coupons.push(coupon._id);
    await user.save();
  };
  try {
    if (maintype === "basic") {
      coupon = await generateBasicDiscount(basicDiscount);

      message = {
        message: `Basic coupon created successfully and is valid for ${basicDiscount.days} days`,
        couponCode: coupon.code,
        validTo: coupon.validTo,
      };
    } else if (maintype === "express") {
      coupon = await generateExpressDiscount(expressDiscount);
      message = {
        message: `Express coupon created successfully and is valid for ${expressDiscount.days} days`,
        couponCode: coupon.code,
        validTo: coupon.validTo,
      };
    } else if (maintype === "premium") {
      coupon = await generatePremiumDiscount(premiumDiscount);
      message = {
        message: `Premium coupon created successfully and is valid for ${premiumDiscount.days} days`,
        couponCode: coupon.code,
        validTo: coupon.validTo,
      };
    }

    return message;
  } catch (e) {
    if (e instanceof customError) {
      throw customError(e.message, e.statusCode).serveError();
    }
    throw new customError(`${e.error}`, 500).serveError();
  }
};

//get order
const getOrder = async (orderId) => {
  try {
    let order = await Order.findById(orderId);
    if (!order) {
      throw new customError("Order not found", 400).serveError();
    }
    return {
      message: "Order found",
      data: order,
    };
  } catch (e) {
    if (e instanceof customError) {
      throw customError(e.message, e.statusCode).serveError();
    }
    throw new customError(`${e.error}`, 400).serveError();
  }
};

//get all users orders
const getOrders = async (userId) => {
  try {
    let user = await User.findById(userId);
    if (!user) {
      throw new customError("User not found", 400).serveError();
    }

    let userOrders = await Order.find({
      $or: [
        { _id: { $in: user.water.ordersFrom } },
        { _id: { $in: user.water.ordersTo } },
      ],
    });

    if (!userOrders.length) {
      return {
        message: "No orders found",
        data: userOrders,
      };
    }
    return {
      message: "Orders found",
      data: userOrders,
    };
  } catch (e) {
    if (e instanceof customError) {
      throw customError(e.message, e.statusCode).serveError();
    }
    throw new customError(`${e.error}`, 400).serveError();
  }
};

//get all users FROMME orders
const getOrderFrom = async (userId) => {
  try {
    let user = await User.findById(userId);
    if (!user) {
      throw new customError("User not found", 400).serveError();
    }
    let orders = await Order.find({ _id: { $in: user.water.ordersFrom } });
    if (!orders.length) {
      return {
        message: "No orders found, Place an order...",
        data: orders,
      };
    }
    return {
      message: "Orders found",
      data: orders,
    };
  } catch (e) {
    if (e instanceof customError) {
      throw customError(e.message, e.statusCode).serveError();
    }
    throw new customError(`${e.error}`, 400).serveError();
  }
};

//get all users TO orders
const getOrderTo = async (userId) => {
  try {
    let user = await User.findById(userId);
    if (!user) {
      throw new customError("User not found", 400).serveError();
    }
    let orders = await Order.find({ _id: { $in: user.water.ordersTo } });

    if (!orders.length) {
      return {
        message: "No orders found, expect an order...",
        data: orders,
      };
    }
    return {
      message: "Orders found",
      data: orders,
    };
  } catch (e) {
    if (e instanceof customError) {
      throw customError(e.message, e.statusCode).serveError();
    }
    throw new customError(`${e.error}`, 400).serveError();
  }
};

//get order cordinates
const getOrderCordinates = async (orderId) => {
  try {
    let order = await Order.findById(orderId);
    if (!order) {
      throw new customError("Order not found", 400).serveError();
    }
    const cordinates = {
      senderCordinates: order.tracking.senderCordinates,
      receiverCordinates: order.tracking.receiverCordinates,
    };
    console.log("🚀 ~ getOrderCordinates ~ cordinates:", cordinates);

    if (
      cordinates.senderCordinates === undefined &&
      cordinates.receiverCordinates === undefined
    ) {
      return {
        message: "No cordinates found for this order. Hold lets create it",
        data: cordinates,
      };
    }
    return {
      message: "Order found",
      data: cordinates,
    };
  } catch (e) {
    if (e instanceof customError) {
      throw customError(e.message, e.statusCode).serveError();
    }
    throw new customError(`${e.error}`, 400).serveError();
  }
};

//check water transport rates(standard and express)
const getWaterRates = async (weight) => {
  try {
    let standardCost = getCost(weight);
    let expressCost = getExpressCost(weight);
    return {
      message: "Costs found",
      data: {
        standardCost,
        expressCost,
      },
    };
  } catch (e) {
    throw new customError(`${e.message}`, 400).serveError();
  }
};

//get water cost with coupons applied
const getWaterRatesWithCoupons = async (weight, coupon, userId) => {
  try {
    let standardCost = getCost(weight);
    let expressCost = getExpressCost(weight);

    //auth Coupon
    let couponDetails = await Coupon.findOne({ code: coupon });
    let user = await User.findById(userId);
    if (!couponDetails) {
      throw new customError("Coupon not found", 400).serveError();
    }
    if (couponDetails.validTo < new Date()) {
      throw new customError("Coupon expired", 400).serveError();
    }
    if (couponDetails.maxUsage <= 0) {
      throw new customError("Coupon completely Used", 400).serveError();
    }
    let userCoupon = user.coupons.find((c) => c === couponDetails._id);
    if (userCoupon) {
      throw new customError("Coupon already used", 400).serveError();
    }
    //apply coupon to cost
    let standardCostWithCoupon = getCostWithDiscount(
      weight,
      couponDetails.discount
    );
    let expressCostWithCoupon = getExpressCostWithDiscount(
      weight,
      couponDetails.discount
    );

    //update coupon usage count
    couponDetails.maxUsage -= 1;
    await couponDetails.save();
    //add coupon to user
    user.coupons.push(couponDetails._id);
    await user.save();

    return {
      message: "Costs found",
      data: {
        standardCost: standardCost,
        expressCost: expressCost,
        standardCostWithCoupon: standardCostWithCoupon,
        expressCostWithCoupon: expressCostWithCoupon,
      },
    };
  } catch (e) {
    console.log(e);
    if (e instanceof customError) {
      throw new customError(e.message, e.statusCode).serveError();
    }
    throw new customError(`${e.error}`, 400).serveError();
  }
};

//complete order
const completeOrder = async (orderId, currentLocationCordinates) => {
  const orderID = orderId.orderID;
  const location = orderId.currentLocation;
  if (!orderID || !location) {
    throw new customError("Invalid data", 400).serveError();
  }
  try {
    let order = await Order.findById(orderID);
    if (!order) {
      throw new customError("Order not found", 400).serveError();
    }
    if (order.status === "delivered") {
      throw new customError("Order already Completed", 400).serveError();
    }

    //check if sender address equals current location or close by 20metres
    let senderCordinates = {
      lat: order.tracking.senderCordinates.lat,
      lng: order.tracking.senderCordinates.lng,
    };
    let currentCordinates = await getCordinates(location);
    console.log("🚀 ~ completeOrder ~ currentCordinates:", currentCordinates);

    let distance = await getDistance(senderCordinates, currentCordinates);

    if (distance.distance > 20) {
      throw new customError(
        "You are not at the sender's location",
        400
      ).serveError();
    }

    if (distance.distance === null) {
      throw new customError("Invalid location", 400).serveError();
    }
    //update order
    order.status = "delivered";
    await order.save();
    return {
      message: "Order delivered successfully, marked as completed",
    };
  } catch (e) {
    if (e instanceof customError) {
      console.log(e, "ERROR DE CUSTOME");
      throw customError(e.message, e.statusCode).serveError();
    }
    console.log(e, "ERROR DE NORMAL");
    throw new customError(`${e.error}`, 400).serveError();
  }
};

//move from pending to precessing
const processOrder = async (orderId) => {
  try {
    let order = await Order.findById(orderId);
    if (!order) {
      throw new customError("Order not found", 400).serveError();
    }
    if (order.status === "processing") {
      throw new customError("Order already processing", 400).serveError();
    }
    if (order.status === "delivered") {
      throw new customError("Order already delivered", 400).serveError();
    }
    order.status = "processing";
    await order.save();
    return {
      message: "Order processing successfully",
      data: order,
    };
  } catch (e) {
    if (e instanceof customError) {
      throw customError(e.message, e.statusCode).serveError();
    }
    throw new customError(`${e.message}`, 400).serveError();
  }
};

//get order by tracking code
const getOrderByTrackingCode = async (trackingCode) => {
  try {
    let order = await Order.findOne({
      "tracking.trackingNumber": trackingCode,
    });
    if (!order) {
      throw new customError("Order not found", 400).serveError();
    }
    return {
      message: "Order found",
      data: order,
    };
  } catch (e) {
    if (e instanceof customError) {
      throw customError(e.message, e.statusCode).serveError();
    }
    throw new customError(`${e.error}`, 400).serveError();
  }
};

//get estimated delivery details by cost
const getEstimatedDeliveryDate = async (sendDate, costType) => {
  try {
    // Check if sendDate is in format YYYY/MM/DD
    if (sendDate && typeof sendDate === "string" && sendDate.includes("/")) {
      sendDate = sendDate.replace(/\//g, "-");
    }

    return {
      express: getEstimatedDelivery(sendDate, "express"),
      standard: getEstimatedDeliveryStandard(sendDate, "standard"),
    };
  } catch (e) {
    if (e instanceof customError) {
      throw customError(e.message, e.statusCode).serveError();
    }
    throw new customError(`${e.error}`, 400).serveError();
  }
};

export default {
  sendOrder,
  sendCoupon,
  getOrder,
  getOrders,
  getOrderFrom,
  getOrderTo,
  getOrderCordinates,
  getWaterRates,
  getWaterRatesWithCoupons,
  completeOrder,
  processOrder,
  getOrderByTrackingCode,
  getEstimatedDeliveryDate,
};
