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
        default: "top-up"
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
