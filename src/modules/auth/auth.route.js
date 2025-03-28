import Router from "express";
import validate from "../../middlewares/validate.js";
import validator from "../../validations/auth.validation.js";
import routeLogger from "../../middlewares/route.js";
import authController from "./auth.controller.js";

const router = Router();

router.post("/register", validate(validator.register), authController.register);
router.post("/google-signin", authController.googleSignIn);
router.post("/login", validate(validator.login), authController.login);
router.post("/logout", validate(validator.logout), authController.logout);
router.post(
  "/refresh-tokens",
  routeLogger,
  validate(validator.refreshTokens),
  authController.refreshTokens
);
router.post(
  "/forgot-password",
  routeLogger,
  validate(validator.forgotPassword),
  authController.forgotPassword
);
router.post(
  "/reset-password",
  routeLogger,
  validate(validator.resetPassword),
  authController.resetPassword
);
router.post("/send-otp", routeLogger, authController.sendEmailOTP);
router.post("/verify-otp", routeLogger, authController.verifyOTP);

export default router;
