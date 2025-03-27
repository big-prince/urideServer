import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync.js";
import authService from "./auth.service.js";
import userService from "../users/user.service.js";
import tokenService from "./token.service.js";
import { sendForgotPasswordEmail } from "../com/emails/email.service.js";

const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

const googleSignIn = catchAsync(async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ message: "Google ID Token is required" });
  }
  const { user } = await userService.googleSignIn(idToken);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  console.log("Login Successfull");
  res.send({ user, tokens });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send({ status: httpStatus.NOT_FOUND });
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.status(httpStatus.OK).send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(
    req.body.email
  );
  await sendForgotPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send({
    status: httpStatus.NO_CONTENT,
    message: "Password reset email has been sent.",
  });
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token, req.body.password);
  res.status(httpStatus.NO_CONTENT).json({
    status: httpStatus.NOT_FOUND,
    message: "Password reset successfully",
  });
});

const sendEmailOTP = catchAsync(async (req, res) => {
  console.log("Email OTP");
  let result = await authService.sendOTP(req.body.email);
  res.status(httpStatus.OK).json(result);
});

const verifyOTP = catchAsync(async (req, res) => {
  const { result, sendData } = await authService.verifyOTP(req.body.otp);
  res.status(httpStatus.OK).send(sendData);
});

export default {
  register,
  login,
  logout,
  googleSignIn,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendEmailOTP,
  verifyOTP,
};
