import mongoose from "mongoose";
import tType from "../../config/transaction.type.js";

const transactionHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      ref: "User",
      required: true,
    },
    data: {
      reference: { type: String, required: true },
      amount: { type: Number, required: true },
      status: { type: String, required: true },
      currency: { type: String, required: true },
      transactionDate: { type: Date, required: true },
      gatewayResponse: { type: String, required: true },
    },
    transactionType: {
      type: String,
      enum: tType,
      required: true,
    },
  },
  { timestamps: true }
);

const TransactionHistory = mongoose.model(
  "TransactionHistory",
  transactionHistorySchema
);

export default TransactionHistory;
