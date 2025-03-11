import { Router } from "express";
import auth from "../../middlewares/auth.js";
import validate from "../../middlewares/validate.js";
import walletController from "../wallet/wallet.controller.js";

const router = Router();

//paystack callback route
router.post("/callback", walletController.paystackCallback);

//initialize payment
router.post("/initialize_payment", walletController.initializePayment);

//verify payment
router.post("/verify_payment", walletController.paymentVerification);

//send wallet details
router.get("/wallet_details", walletController.getWallet);

//send THistory
router.get("/transaction_history", walletController.getTransactionHistory);

export default router;
