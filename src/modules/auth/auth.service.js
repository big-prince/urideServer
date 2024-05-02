import httpStatus from 'http-status';
import Tokenizer from './token.service.js';
import userService from '../users/user.service.js';
import tokenModel from './token.model.js';
import ApiError from '../../utils/ApiError.js';
import tokenTypes from '../../config/tokens.js';
import User from "../users/user.model.js";
import otpGenerator from "otp-generator";
import res from "passport/lib/errors/authenticationerror.js";
import OTP from "./otp.model.js";

/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await userService.getUserByEmail(email);
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  return user;
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logout = async (refreshToken) => {
  const refreshTokenDoc = await tokenModel.findOne({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false });
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
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
    const refreshTokenDoc = await Tokenizer.verifyToken(refreshToken, tokenTypes.REFRESH);
    const user = await userService.getUserById(refreshTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await refreshTokenDoc.remove();
    return Tokenizer.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
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
    const resetPasswordTokenDoc = await Tokenizer.verifyToken(resetPasswordToken, tokenTypes.RESET_PASSWORD);
    const user = await userService.getUserById(resetPasswordTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await userService.deleteMany({ user: user.id, type: tokenTypes.RESET_PASSWORD });
    await userService.updateUserById(user.id, { password: newPassword });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed');
  }
};

const sendOTP = async (email) => {

  // Send OTP For Email Verification
  // exports.sendotp = async (req, res) => {
  try {

    // // Check if user is already present
    // // Find user with provided email
    // const checkUserPresent = await User.findOne({ email });
    // // to be used in case of signup
    //
    // // If user found with provided email
    // if (!checkUserPresent) {
    //   // Return 401 Unauthorized status code with error message
    //   return res.status(401).json({
    //     success: false,
    //     message: `User is not Registered`,
    //   });
    // }
    //
    // if (checkUserPresent.isEmailVerified) {
    //
    // }

    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    let result = await OTP.findOne({ otp: otp });
    console.log("Result is Generate OTP Func");
    console.log("OTP", otp);
    console.log("Result", result);
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
      });
    }
    const otpPayload = { email, otp };
    const otpBody = await OTP.create(otpPayload);
    console.log("OTP Body", otpBody);
    return {
      success: true,
      message: `OTP Sent Successfully`,
      otp,
    };
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}

const verifyOTP = async (otp) => {
  let result = await OTP.findOne({ otp: otp });
  if (!result){
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Code")
  }
  return result;
}

export default {
  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
  resetPassword,
  sendOTP,
  verifyOTP
};
