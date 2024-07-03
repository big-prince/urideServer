import mongoose from "mongoose";

const transactionHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      ref: "User",
      required: true,
    },
    reference: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    status: { type: String, required: true },
    currency: { type: String, required: true },
    transactionDate: { type: Date, required: true },
    gatewayResponse: { type: String, required: true },
  },
  { timestamps: true }
);

const TransactionHistory = mongoose.model(
  "TransactionHistory",
  transactionHistorySchema
);

export default TransactionHistory;
