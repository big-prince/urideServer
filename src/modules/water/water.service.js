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
} from "../../utils/costCalculator.js";
import { estimatedDeliveryDays } from "../../utils/estimatedDeliveryTime.js";
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

//FUNCTIONS
const sendOrder = async (sendInfo) => {
  //generate tracking code
  const trackingCode = generateTrackingCode();
  console.log("🚀 ~ sendOrder ~ trackingCode:", trackingCode);

  //generate estimated delivery days
  const estimatedDelivery = estimatedDeliveryDays(
    sendInfo.receiversInfo.deliveryTime
  );
  const estimatedDeliveryDate = new Date(
    new Date().setDate(new Date().getDate() + estimatedDelivery)
  );
  console.log("🚀 ~ sendOrder ~ estimatedDelivery:", estimatedDelivery);

  //generate Cost
  const standardCost = getCost(sendInfo.parcelInfo.weight);
  const expressCost = getExpressCost(sendInfo.parcelInfo.weight);
  console.log("🚀 ~ sendOrder ~ standardCost:", standardCost);
  console.log("🚀 ~ sendOrder ~ expressCost:", expressCost);

  //finalise
  let query = {
    senderInfo: sendInfo.senderInfo,
    parcelInfo: sendInfo.parcelInfo,
    receiversInfo: sendInfo.receiversInfo,
    estimatedDeliveryDays: estimatedDelivery,
    estimatedDeliveryDate: estimatedDeliveryDate,
    cost: {
      type: sendInfo.costType,
      amount: sendInfo.costType === "express" ? expressCost : standardCost,
    },
    status: "pending",
    tracking: {
      trackingNumber: trackingCode,
    },
    coupon: false,
  };
  if (sendInfo.coupon === true) {
    //verify coupon
    let coupon = await Coupon.findOne({ code: sendInfo.couponCode }).catch(
      (e) => {
        console.log(e);
        throw new customError("Coupon Search Spoilt", 400).serveError();
      }
    );
    console.log(coupon, "SECOND SIDE");
    if (!coupon) {
      throw new customError("Invalid coupon", 400).serveError();
    }
    //check if coupon is still valid
    if (coupon.validTo < new Date()) {
      throw new customError("Coupon has expired", 400).serveError();
    }
    //get discount
    let discount = coupon.discount;
    //get cost after discount
    let costAfterDiscount =
      sendInfo.costType === "express"
        ? getExpressCostWithDiscount(
            sendInfo.weight,
            sendInfo.distance,
            discount
          )
        : getCostWithDiscount(sendInfo.weight, sendInfo.distance, discount);

    //update query
    query.cost.amount = costAfterDiscount;
    query.coupon = true;
  }

  try {
    let newOrder = await Order.create(query);
    return {
      message: "Order created successfully",
      data: newOrder,
    };
  } catch (e) {
    if (e instanceof customError) {
      throw customError(e.message, e.statusCode).serveError();
    }
    throw new customError(`${e.message}`, 400).serveError();
  }
};

const sendCoupon = async (type) => {
  let coupon;
  let maintype = type.type;
  try {
    if (maintype === "basic") {
      coupon = await generateBasicDiscount(basicDiscount);
    } else if (maintype === "express") {
      coupon = await generateExpressDiscount(expressDiscount);
    } else if (maintype === "premium") {
      coupon = await generatePremiumDiscount(premiumDiscount);
    }
    console.log(coupon);
    return coupon;
  } catch (e) {
    console.log(e);
    throw new customError(`${e.message}`, 400).serveError();
  }
};

export default { sendOrder, sendCoupon };
