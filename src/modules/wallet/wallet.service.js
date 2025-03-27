import httpStatus from "http-status";
import ApiError from "../../utils/ApiError.js";
import Wallet from "./wallet.model.js";
import Transaction from "./transaction.models.js";
import Order from "../water/orders.model.js";
import Logger from "../../config/logger.js";
import axios from "axios";
import TransactionHistory from "./transactionHistory.model.js";
import crypto from "crypto";
import { type } from "os";

//import logger
import customError from "../../utils/customError.js";

//callback for paystack
const paystackCallback = async function (body) {
  const { reference } = body;
  console.log(body);
};

//intitialize top-up payment
const initializePayment = async function (details, callback) {
  const { userId, amount, email } = details;
  Logger.info(details);
  // Validate the amount
  if (!amount || amount <= 100) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  // Create a new transaction
  const transaction = new Transaction({
    userId,
    amount,
    reference: `ref_${Date.now()}`,
    transactionType: "top-up",
  });
  await transaction.save().then(() => {
    Logger.info("Transaction Saved.");
  });

  let message;
  // Start transaction
  try {
    // Initialize transaction with Paystack
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100, // Convert to kobo
        reference: transaction.reference,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // console.log(response.data); // Log the response data
    Logger.info("Transaction initialized.");

    message = response.data.data.authorization_url;

    return message;
  } catch (error) {
    Logger.info("Failed to initialize transaction", error);
  }
};

//webhook for verification
const webhookVerification = async function (details, headers) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  let type;

  // Create a hash using the payload and the Paystack secret key
  const hash = crypto
    .createHmac("sha512", secret)
    .update(JSON.stringify(details))
    .digest("hex");

  // Verify the Paystack signature
  if (hash === headers["x-paystack-signature"]) {
    const event = details;

    // Check if the event is a successful charge
    if (event.event === "charge.success") {
      const transaction = await Transaction.findOne({
        reference: event.data.reference,
      });

      // Ensure the transaction is valid and not already marked as success
      if (transaction && transaction.status !== "success") {
        console.log("🚀 ~ webhookVerification ~ transaction:", transaction);
        transaction.status = "success";
        await transaction.save().then(() => {
          Logger.info("Transaction updated.");
        });

        if (transaction.transactionType === "top-up") {
          const wallet = await Wallet.findOne({ userId: transaction.userId });
          wallet.balance += transaction.amount;
          await wallet.save().then(() => {
            Logger.info("Wallet updated.");
          });

          //change type to credit
          type = "credit";
        }
        if (transaction.transactionType === "order") {
          // Update order status
          const order = await Order.findById(transaction.orderId);
          if (!order) {
            throw new customError("Order not found", 404).serveError();
          }
          if (order.paid) {
            console.log("Order already paid for.");
            return;
          }
          order.paid = true;
          await order.save().then(() => {
            Logger.info("Order updated.");
          });

          //change type to debit
          type = "debit";
        }

        async function clearIndexes() {
          try {
            // Drop all indexes for the Rides collection
            await TransactionHistory.collection.dropIndexes();
            Logger.info("All indexes dropped for this collection.");
          } catch (error) {
            Logger.info("Error dropping indexes:", error);
          }
        }
        clearIndexes();

        // Record transaction history
        const data = event.data;
        const transactionHistory = new TransactionHistory({
          userId: transaction.userId,
          data: {
            reference: data.reference,
            amount: data.amount / 100,
            status: data.status,
            currency: data.currency,
            transactionDate: data.paid_at,
            gatewayResponse: data.gateway_response,
            type: transaction.transactionType,
            orderId: transaction.orderId,
          },
          transactionType: type,
        });
        Logger.info(transactionHistory);

        await transactionHistory.save().then(() => {
          Logger.info("Transaction history saved");
        });
      }
    }
  }
};

//send wallet details
const sendWalletDetails = async function (req) {
  const userId = req.query.userId;
  const wallet = await Wallet.findOne({ userId: userId });

  if (!wallet) {
    Logger.info("Wallet not found");
    throw new ApiError(httpStatus.NOT_FOUND, "Wallet not found");
  }
  console.log(wallet);
  const body = {
    balance: wallet.balance,
    userId: wallet.userId,
  };
  return body;
};

//send transaciton history
const sendTransactionHistory = async function (req) {
  const userId = req.query.userId;
  const history = await TransactionHistory.find({ userId: userId });

  return history;
};

//initiliaze payment for order
const initializeOrderPayment = async function (details, callback) {
  const { userId, amount, email, orderId } = details;

  // Validate the amount
  if (!amount || amount <= 100) {
    throw new customError("Invalid amount", 400).serveError();
  }

  // Create a new transaction
  const transactionquery = {
    userId,
    amount,
    reference: `ref_${Date.now()}`,
    transactionType: "order",
    orderId,
  };
  const transaction = new Transaction(transactionquery);
  console.log("🚀 ~ initializeOrderPayment ~ transaction:", transaction);
  await transaction.save().then(() => {
    Logger.info("Transaction Saved.");
  });

  let message;
  // Start transaction
  try {
    // Initialize transaction with Paystack
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100, // Convert to kobo
        reference: transaction.reference,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // console.log(response.data); // Log the response data
    Logger.info("Transaction initialized.");

    message = response.data.data.authorization_url;

    return message;
  } catch (error) {
    Logger.info("Failed to initialize transaction", error);
  }
};

export default {
  initializePayment,
  paystackCallback,
  webhookVerification,
  sendWalletDetails,
  sendTransactionHistory,
  initializeOrderPayment,
};
