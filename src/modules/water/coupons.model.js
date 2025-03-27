import mongoose from "mongoose";
import toJSON from "../../plugins/toJSON.plugin.js";

const couponSchema = mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validTo: {
      type: Date,
      required: true,
    },
    usageCount: {
      type: Number,
      required: true,
      default: 0,
    },
    maxUsage: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

couponSchema.plugin(toJSON);

const Coupon = mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);

export default Coupon;
