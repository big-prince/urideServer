import Mongoose from "mongoose";
import Validator from "validator";
import Bcrypt from "bcryptjs";
import toJSON from "../../plugins/toJSON.plugin.js";
import paginate from "../../plugins/paginate.plugin.js";
import httpStatus from "http-status";
import ApiError from "../../utils/ApiError.js";
import Response from "../../utils/utils.js";

const walletSchema = new Mongoose.Schema(
  {
    userId: {
      type: String,
      ref: "User",
      required: true,
    },
    balance: {
      type: Number,
      default: 0.0,
      set: (v) => parseFloat(v),
    },
    currency: {
      type: String,
      default: "NGN",
    },
    held_funds: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default Mongoose.model("Wallet", walletSchema);
