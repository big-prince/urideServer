import mongoose from "mongoose";
import toJSON from "../../plugins/toJSON.plugin.js";

//files
import { orderCategory } from "../../utils/enums/order.category.js";

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderInfo: {
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
        type: Date,
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
        type: Date,
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
      unique: true,
      required: false,
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
    paid: {
      type: Boolean,
      default: false,
    },
    tracking: {
      trackingNumber: {
        type: String,
        required: true,
        unique: true,
      },
      distance: {
        type: Number,
        required: true,
      },
      distanceText: {
        type: String,
      },
      senderCordinates: {
        type: {
          lat: {
            type: Number,
            required: true,
          },
          lng: {
            type: Number,
            required: true,
          },
        },
        required: true,
      },

      receiverCordinates: {
        type: {
          lat: {
            type: Number,
            required: true,
          },
          lng: {
            type: Number,
            required: true,
          },
        },
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
orderSchema.plugin(toJSON);

//presave
// orderSchema.pre("save", async function (next) {
//   //drop index for coupon code
//   if (this.model("Order").collection.index("couponCode_1")) {
//     await this.model("Order").collection.dropIndex("couponCode_1");
//   }
//   next();
// });

//model
const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
