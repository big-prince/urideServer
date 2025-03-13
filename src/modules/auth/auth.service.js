import httpStatus from "http-status";
import Tokenizer from "./token.service.js";
import userService from "../users/user.service.js";
import tokenModel from "./token.model.js";
import ApiError from "../../utils/ApiError.js";
import tokenTypes from "../../config/tokens.js";
import User from "../users/user.model.js";
import otpGenerator from "otp-generator";
import OTP from "./otp.model.js";
import { sendOTPEmail } from "../com/emails/email.service.js";

/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await userService.getUserByEmail(email);
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect email or password");
  }
  return user;
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logout = async (refreshToken) => {
  const refreshTokenDoc = await tokenModel.findOne({
    token: refreshToken,
    type: tokenTypes.REFRESH,
    blacklisted: false,
  });

  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, "Refresh token not found");
  }

  await refreshTokenDoc.remove();
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await Tokenizer.verifyToken(
      refreshToken,
      tokenTypes.REFRESH
    );

    const user = await userService.getUserById(refreshTokenDoc.user);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    await refreshTokenDoc.remove();
    return Tokenizer.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      error instanceof ApiError ? error.message : "Please authenticate"
    );
  }
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
const resetPassword = async (resetPasswordToken, newPassword) => {
  try {
    const resetPasswordTokenDoc = await Tokenizer.verifyToken(
      resetPasswordToken,
      tokenTypes.RESET_PASSWORD
    );

    const user = await userService.getUserById(resetPasswordTokenDoc.user);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    await tokenModel.deleteMany({
      user: user.id,
      type: tokenTypes.RESET_PASSWORD,
    });

    await userService.updateUserById(user.id, { password: newPassword });
    return { success: true, message: "Password reset successfully" };
  } catch (error) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      error instanceof ApiError ? error.message : "Password reset failed"
    );
  }
};

/**
 * Generate and send OTP to user email
 * @param {string} email - User's email address
 * @returns {Promise<Object>} - Object with success status and message
 */
const sendOTP = async (email) => {
  if (!email || typeof email !== "string") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Valid email is required");
  }

  // Check if user exists with the provided email
  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "User not registered with this email"
    );
  }

  // Generate a unique 6-digit OTP
  let otp = "";
  let isUnique = false;
  const maxAttempts = 5;

  for (let attempts = 0; attempts < maxAttempts && !isUnique; attempts++) {
    otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    // Check if OTP already exists
    const existingOTP = await OTP.findOne({ otp });
    if (!existingOTP) {
      isUnique = true;
    }
  }

  if (!isUnique) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to generate unique OTP"
    );
  }

  // Delete any existing OTPs for this email
  await OTP.deleteMany({ email });

  // Create OTP with expiration (15 minutes)
  const otpPayload = {
    email,
    otp,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
  };

  await OTP.create(otpPayload);

  // Send OTP to user email
  await sendOTPEmail(email, otp);

  return {
    success: true,
    message: "OTP sent successfully",
  };
};

/**
 * Verify OTP and return user data
 * @param {string} otp - OTP code to verify
 * @returns {Promise<Object>} - User data with auth token
 */
const verifyOTP = async (otp) => {
  const result = await OTP.findOne({
    otp,
    expiresAt: { $gt: new Date() },
  });

  if (!result) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid or expired code");
  }

  const userEmail = result.email;
  const user = await User.findOne({ email: userEmail });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const userToken = await tokenModel.findOne({ user: user._id });

  if (!userToken) {
    throw new ApiError(httpStatus.NOT_FOUND, "User token not found");
  }

  // Clean up the OTP after successful verification
  await OTP.deleteOne({ _id: result._id });

  return {
    result,
    sendData: {
      email: userEmail,
      firstName: user.firstName,
      lastName: user.lastName,
      id: user._id,
      role: user.role,
      Bearer_token: userToken.token,
      token_type: userToken.type,
      emailVerified: true,
    },
  };
};

export default {
  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
  resetPassword,
  sendOTP,
  verifyOTP,
};
