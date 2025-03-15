import Mongoose from "mongoose";
import { sendOTPEmail } from "../com/emails/email.service.js";

const OTPSchema = new Mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 60 * 5,
    },
  },
  { timestamps: true }
);

/**
 * @typedef Token
 */
const OTP = Mongoose.model("OTP", OTPSchema);

export default OTP;
