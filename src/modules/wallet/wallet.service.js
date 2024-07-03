import httpStatus from "http-status";
import ApiError from "../../utils/ApiError.js";
import Wallet from "./wallet.model.js";
import Transaction from "./transaction.models.js";
import Logger from "../../config/logger.js";
import axios from "axios";
import transactionHistory from "./transactionHistory.model.js";

//callback for paystack
const paystackCallback = async function (body) {
  const { reference } = body;
  console.log(body);
};

//intitialize payment
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
        transaction.status = "success";
        await transaction.save();

        // Update the user's wallet balance
        const wallet = await Wallet.findOne({ userId: transaction.userId });
        wallet.balance += event.data.amount / 100; // Assuming the amount is in kobo, converting to Naira
        await wallet.save();

        // Record transaction history
        await recordTransactionHistory(transaction.userId, event.data);
      }
    }
  }
};

// Function to record transaction history
const recordTransactionHistory = async (userId, data) => {
  const transactionHistory = new TransactionHistory({
    userId,
    reference: data.reference,
    amount: data.amount / 100, // Convert to Naira if needed
    status: data.status,
    currency: data.currency,
    transactionDate: data.paid_at,
    gatewayResponse: data.gateway_response,
  });

  await transactionHistory.save();
};

export default {
  initializePayment,
  paystackCallback,
  webhookVerification,
};
