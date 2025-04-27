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
        default: "Unknown Sender",
      },
      sender_phone: {
        type: String,
        required: true,
        default: "0000000000",
      },
      pickupAddress: {
        type: String,
        required: true,
        default: "No address provided",
      },
      pickupTime: {
        type: Date,
        required: true,
        default: Date.now,
      },
      description: {
        type: String,
        required: true,
        default: "No description provided",
      },
    },
    parcelInfo: {
      weight: {
        type: String,
        required: true,
        default: "0 kg",
      },
      dimensions: {
        type: String,
        required: true,
        default: "0x0x0",
      },
      category: {
        type: String,
        required: true,
        enum: orderCategory,
        default: orderCategory[0], // Default to first category in the enum
      },
    },
    receiversInfo: {
      receiversName: {
        type: String,
        required: true,
        default: "Unknown Receiver",
      },
      receiversPhone: {
        type: String,
        required: true,
        default: "0000000000",
      },
      receiversAddress: {
        type: String,
        required: true,
        default: "No address provided",
      },
      deliveryInstruction: {
        type: String,
        required: false,
        default: "No specific instructions",
      },
    },
    coupon: {
      type: Boolean,
      default: false,
      required: true,
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
      default: 3,
    },
    estimatedDeliveryDate: {
      type: Date,
      required: true,
      default: () => {
        const date = new Date();
        date.setDate(date.getDate() + 3);
        return date;
      },
    },
    cost: {
      type: {
        type: String,
        required: true,
        enum: ["express", "standard"],
        default: "standard",
      },
      amount: {
        type: Number,
        required: true,
        default: 0,
      },
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "processing", "delivered"],
      default: "pending",
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
        default: () => Math.random().toString(36).substring(2, 10).toUpperCase(),
      },
      distance: {
        type: Number,
        required: true,
        default: 0,
      },
      distanceText: {
        type: String,
        default: "0 km",
      },
      senderCordinates: {
        type: {
          lat: {
            type: Number,
            required: true,
            default: 0,
          },
          lng: {
            type: Number,
            required: true,
            default: 0,
          },
        },
        required: true,
        default: { lat: 0, lng: 0 },
      },
      receiverCordinates: {
        type: {
          lat: {
            type: Number,
            required: true,
            default: 0,
          },
          lng: {
            type: Number,
            required: true,
            default: 0,
          },
        },
        required: true,
        default: { lat: 0, lng: 0 },
      },
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
orderSchema.plugin(toJSON);

// Function to drop all indexes for Order
const dropAllIndexes = async () => {
  try {
    if (mongoose.connection.collections.orders) {
      console.log('Current indexes for Order collection:');
      const indexes = await mongoose.connection.collections.orders.listIndexes().toArray();
      console.log(indexes);
      await mongoose.connection.collections.orders.dropIndexes();
      console.log('All indexes for Order collection have been dropped');
    } else {
      console.log('Order collection does not exist yet');
    }
  } catch (error) {
    console.error('Error dropping indexes:', error);
  }
}
mongoose.connection.once('open', dropAllIndexes);

// Pre-save middleware to handle couponCode uniqueness issue
orderSchema.pre('save', function (next) {

  if (!this.coupon || this.couponCode === null) {
    this.couponCode = undefined;
  }
  next();
});

//model
const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
