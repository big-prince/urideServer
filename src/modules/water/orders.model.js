import mongoose from "mongoose";
import toJSON from "../../plugins/toJSON.plugin.js";

//files
import { orderCategory } from "../../utils/enums/order.category.js";

const orderSchema = mongoose.Schema(
  {
    senderInfo: {
      sender_id: {
        type: String,
        required: true,
      },
      sender_name: {
        type: String,
        required: true,
      },
      sender_phone: {
        type: String,
        required: true,
      },
      pickupAddress: {
        type: String,
        required: true,
      },
      pickupTime: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
    },
    parcelInfo: {
      weight: {
        type: String,
        required: true,
      },
      dimensions: {
        type: String,
        required: true,
      },
      category: {
        type: String,
        required: true,
        enum: orderCategory,
      },
    },
    receiversInfo: {
      receiversName: {
        type: String,
        required: true,
      },
      receiversPhone: {
        type: String,
        required: true,
      },
      receiversAddress: {
        type: String,
        required: true,
      },
      deliveryTime: {
        type: String,
        required: true,
      },
      deliveryInstruction: {
        type: String,
        required: true,
      },
    },
    coupon: {
      type: Boolean,
      default: false,
    },
    couponCode: {
      type: String,
      default: null,
      required: () => this.coupon,
    },
    //delivery time in days
    estimatedDeliveryDays: {
      type: Number,
      required: true,
    },
    estimatedDeliveryDate: {
      type: Date,
      required: true,
    },
    cost: {
      type: {
        type: String,
        required: true,
        enum: ["express", "standard"],
      },
      amount: {
        type: Number,
        required: true,
      },
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "processing", "delivered"],
    },

    tracking: {
      trackingNumber: {
        type: String,
        required: true,
        unique: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
orderSchema.plugin(toJSON);

//model
const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
