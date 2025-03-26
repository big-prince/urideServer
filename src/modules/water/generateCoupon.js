import { v4 as uuidv4 } from "uuid";
import Coupon from "./coupons.model.js";

//generate 5 random digit coupon
export function generateCoupon() {
  return uuidv4().substring(0, 5);
}

export const basicDiscount = {
  discount: 5,
  days: 3,
};
export const expressDiscount = {
  discount: 10,
  days: 2,
};
export const premiumDiscount = {
  discount: 15,
  days: 2,
};

export async function generateBasicDiscount(basicDiscount) {
  let coupon = generateCoupon();
  // Extract discount and days from the basicDiscount object
  const { discount, days } = basicDiscount;
  let couponData = {
    code: coupon,
    discount: discount,
    validFrom: new Date(),
    validTo: new Date(new Date().setDate(new Date().getDate() + days)),
  };
  let newCoupon = await Coupon.create(couponData);
  return newCoupon;
}

export async function generateExpressDiscount(expressDiscount) {
  let coupon = generateCoupon();
  const { discount, days } = expressDiscount;
  let couponData = {
    code: coupon,
    discount: discount,
    validFrom: new Date(),
    validTo: new Date(new Date().setDate(new Date().getDate + days)),
  };
  let newCoupon = await Coupon.create(couponData);
  return newCoupon;
}

export async function generatePremiumDiscount(premiumDiscount) {
  let coupon = generateCoupon();
  const { discount, days } = premiumDiscount;
  let couponData = {
    code: coupon,
    discount: discount,
    validFrom: new Date(),
    validTo: new Date(new Date().setDate(new Date().getDate + days)),
  };
  let newCoupon = await Coupon.create(couponData);
  return newCoupon;
}
