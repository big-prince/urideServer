import { Resend } from "resend";
import { welcomeEmail } from "./templs/welcome.js";
import { passwordResetEmail } from "./templs/reset.js";
import { sendOtpEmailTemplate } from "./templs/otp.js";
import { sendSecurityCodeEmailTemplate } from "./templs/securityCode.js";
import User from "../../users/user.model.js";
import httpStatus from "http-status";
import ApiError from "../../../utils/ApiError.js";

const resend = new Resend(process.env.RESEND_API_KEY);

async function fireEmail(message) {
  console.log("Starting fireEmail with Resend...");
  try {
    console.log("Attempting to send email with Resend...");
    const { data, error } = await resend.emails.send(message);
    if (error) {
      console.error("Failed to send email with Resend:", error);
      return {
        messageId: null,
        status: "failed",
        message: "Failed to send email with Resend",
      };
    }
    console.log("Email sent successfully:", data);
    return {
      messageId: data.id, // Resend’s unique ID for the email
      status: "sent",
    };
  } catch (error) {
    console.error("Failed to send email with Resend:", error);
    return {
      messageId: null,
      status: "failed",
      message: "Failed to send email with Resend",
    };
  }
}

export const sendWelcomeEmail = async (receiverEmail, receiverName) => {
  const message = {
    from: process.env.EMAIL_FROM,
    to: receiverEmail,
    subject: "Welcome to uRide!",
    html: welcomeEmail(receiverName),
  };
  return fireEmail(message);
};

export const sendForgotPasswordEmail = async (
  receiverEmail,
  resetPasswordToken
) => {
  const resetPasswordLink = `${process.env.RESET_PASSWORD_URL}?token=${resetPasswordToken}`;
  const message = {
    from: process.env.EMAIL_FROM,
    to: receiverEmail,
    subject: "Reset Your Password",
    html: passwordResetEmail(receiverEmail, resetPasswordLink),
  };
  return fireEmail(message);
};

export const sendOTPEmail = async (receiverEmail, otp) => {
  const user = await User.findOne({ email: receiverEmail });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not Found");
  }
  console.log(process.env.EMAIL_FROM);
  const message = {
    from: process.env.EMAIL_FROM,
    to: receiverEmail,
    subject: "OTP from uRide",
    html: sendOtpEmailTemplate(user.firstName, otp),
  };
  return fireEmail(message);
};

export const sendSecurityCodeEmail = async (
  receiverEmail,
  code,
  rideDetails
) => {
  console.log(rideDetails, "The Details");
  const user = await User.findOne({ email: receiverEmail });
  const driverDetails = await User.findOne({ email: rideDetails.driver });
  const driverFullName = `${driverDetails.firstName} ${driverDetails.lastName}`;
  const rideOptions = {
    driver: driverFullName,
    departure_time: rideDetails.departure_time,
    destination: rideDetails.destination,
    origin: rideDetails.origin,
    price: rideDetails.price,
  };
  const message = {
    from: process.env.EMAIL_FROM,
    to: receiverEmail,
    subject: "Security Code from uRide",
    html: sendSecurityCodeEmailTemplate(user.firstName, code, rideOptions),
  };
  return fireEmail(message);
};
