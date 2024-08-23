import nodemailer from "nodemailer";
import { welcomeEmail } from "./templs/welcome.js";
import { passwordResetEmail } from "./templs/reset.js";
import { sendOtpEmailTemplate } from "./templs/otp.js";
import { sendSecurityCodeEmailTemplate } from "./templs/securityCode.js";
import User from "../../users/user.model.js";
import httpStatus from "http-status";
import ApiError from "../../../utils/ApiError.js";

let config = {
  service: "gmail", // your email domain
  auth: {
    user: process.env.SMTP_USERNAME, // your email address
    pass: process.env.SMTP_PASSWORD, // your password
  },
};

let transporter = nodemailer.createTransport(config);

//send welcome email
export const sendWelcomeEmail = async (receiverEmail, receiverName) => {
  let message = {
    from: process.env.EMAIL_FROM, // sender address
    to: receiverEmail, // list of receivers
    subject: "Welcome to uRide!", // Subject line
    html: welcomeEmail(receiverName), // html body
  };

  try {
    const info = await fireEmail(message);
    console.log(info); // Add this line to log the info object
    return {
      msg: "Email sent",
      info: info.messageId,
      preview: nodemailer.getTestMessageUrl(info),
    };
  } catch (err) {
    throw new Error(err);
  }
};

// send forgot password email
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

  try {
    const info = await fireEmail(message);
    console.log(info); // Add this line to log the info object
    return {
      msg: "Email sent",
      info: info.messageId,
      preview: nodemailer.getTestMessageUrl(info),
    };
  } catch (err) {
    throw new Error(err);
  }
};

// send otp to email
export const sendOTPEmail = async (receiverEmail, otp) => {
  const user = await User.findOne({ email: receiverEmail });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not Found");
  }
  const message = {
    from: process.env.EMAIL_FROM,
    to: receiverEmail,
    subject: "OTP from uRide",
    html: sendOtpEmailTemplate(user.firstName, otp),
  };

  try {
    const info = await fireEmail(message);
    // console.log(info); // Add this line to log the info object
    return {
      msg: "Email sent",
      info: info.messageId,
      preview: nodemailer.getTestMessageUrl(info),
    };
  } catch (err) {
    throw new Error(err);
  }
};

//send security code Email
export const sendSecurityCodeEmail = async (
  receiverEmail,
  code,
  rideDetails
) => {
  console.log(rideDetails, "The Details");
  const user = await User.findOne({ email: receiverEmail });
  const driverDetails = await User.findOne({ email: rideDetails.driver });
  //construct driver fullname
  const driverFullName = `${driverDetails.firstName} ${driverDetails.lastName}`;

  const rideOptions = {
    driver: driverFullName,
    departure_time: rideDetails.departure_time,
    destination: rideDetails.destination,
    origin: rideDetails.origin,
    price: rideDetails.price,
  };
  console.log(rideOptions);
  const message = {
    from: process.env.EMAIL_FROM,
    to: receiverEmail,
    subject: "Security Code from uRide",
    html: sendSecurityCodeEmailTemplate(user.firstName, code, rideOptions),
  };

  try {
    const info = await fireEmail(message);
    console.log(info);
    return {
      msg: "Email sent",
      info: info.messageId,
      preview: nodemailer.getTestMessageUrl(info),
    };
  } catch (err) {
    throw new Error(err);
  }
};

async function fireEmail(message) {
  try {
    const info = await transporter.sendMail(message);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error(error);
  }
}
