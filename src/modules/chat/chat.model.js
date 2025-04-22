import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    type: {
      type: String,
      enum: ["text", "image", "location"],
      default: "text",
    },
    mediaUrl: { type: String },
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// Index for efficient queries
messageSchema.index({ from: 1, to: 1, createdAt: -1 });

// Virtual for conversation ID (helpful for grouping)
messageSchema.virtual("conversationId").get(function () {
  return [this.from, this.to].sort().join("_");
});

export default mongoose.model("Message", messageSchema);
