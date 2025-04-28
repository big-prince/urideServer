import { Router } from "express";
import auth from "../../middlewares/logged.js";
import validate from "../../middlewares/validate.js";
import extractAccess from "../../middlewares/extractAccess.js";
import routeLogger from "../../middlewares/route.js";
import walletController from "../wallet/wallet.controller.js";

const router = Router();

//paystack callback route
router.post(
  "/callback",
  routeLogger,
  extractAccess,
  walletController.paystackCallback
);

//initialize payment
router.post(
  "/initialize_payment",
  routeLogger,
  extractAccess,
  walletController.initializePayment
);

//verify payment
router.post(
  "/verify_payment",
  routeLogger,
  walletController.paymentVerification
);

//send wallet details
router.get(
  "/wallet_details",
  routeLogger,
  extractAccess,
  walletController.getWallet
);

//send THistory
router.get(
  "/transaction_history",
  routeLogger,
  extractAccess,
  walletController.getTransactionHistory
);

//intialize order payment
router.post(
  "/initialize_order_payment",
  routeLogger,
  extractAccess,
  walletController.initializeOrderPayment
);

router.get(
  "/initialize_flight_payment/:bookingId",
  auth,
  routeLogger,
  walletController.initializeFlightPayment
);

export default router;
