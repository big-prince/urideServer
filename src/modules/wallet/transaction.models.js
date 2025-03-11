import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    reference: {
      type: String,
      required: true,
      unique: true,
    },
    transactionType: {
      type: String,
      enum: ["top-up", "payment"],
      default: "top-up",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", transactionSchema);
