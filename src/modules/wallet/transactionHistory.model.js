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
      amount: { type: Number, required: true, default: 0 },
      status: { type: String, required: true, default: "pending" },
      currency: { type: String, required: true, default: "NGN" },
      transactionDate: { type: Date, required: true, default: Date.now },
      gatewayResponse: { type: String, required: true, default: "Initialized" },
      type: {
        type: String,
        required: true,
        enum: ["top-up", "payment", "order"],
        default: "payment"
      },
      orderId: { type: String, ref: "Order", default: null },
    },
    transactionType: {
      type: String,
      enum: tType,
      required: true,
      default: "credit"
    },
  },
  { timestamps: true }
);
transactionHistorySchema.index({ "data.reference": 1 }, { unique: true });

// Function to drop all indexes for Order
// Function to drop all indexes for TransactionHistory
const dropAllIndexes = async () => {
  try {
    if (mongoose.connection.collections.transactionhistories) {
      console.log('Current indexes for TransactionHistory collection:');
      const indexes = await mongoose.connection.collections.transactionhistories.listIndexes().toArray();
      console.log(indexes);
      await mongoose.connection.collections.transactionhistories.dropIndexes();
      console.log('All indexes for TransactionHistory collection have been dropped');
    } else {
      console.log('TransactionHistory collection does not exist yet');
    }
  } catch (error) {
    console.error('Error dropping indexes:', error);
  }
}
mongoose.connection.once('open', dropAllIndexes);

const TransactionHistory = mongoose.model(
  "TransactionHistory",
  transactionHistorySchema
);

export default TransactionHistory;
