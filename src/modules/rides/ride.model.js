import Mongoose from "mongoose";
import toJSON from "../../plugins/toJSON.plugin.js";
import paginate from "../../plugins/paginate.plugin.js";
//import Logger
import Logger from "../../config/logger.js";
import logger from "../../config/logger.js";
import rideStatus from "../../config/ride.status.js";

let ObjectId = Mongoose.Types.ObjectId;

const rideSchema = new Mongoose.Schema({
  origin: {
    name: { type: String, required: false },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: { String },
        required: true,
      },
    },
  },
  destination: {
    name: { type: String, required: false },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: { String },
        required: true,
      },
    },
  },
  stops: [
    {
      name: { type: String, required: false },
      location: {
        type: {
          type: String,
          enum: ["Point"],
          required: true,
        },
        coordinates: {
          type: { String },
          required: true,
        },
      },
    },
  ],
  type: {
    type: String,
    enum: ["One-time", "Recurring"],
    required: true,
  },
  other: {
    type: String,
    enum: ["Bikes", "Pets", "Skates", "None"],
    required: false,
  },
  price: {
    //price per seat
    type: Number,
    required: true,
  },
  brs: {
    type: Number,
    required: true,
  },
  departure_time: { type: Date, required: true },
  total_capacity: { type: Number, required: true },
  remaining_capacity: { type: Number, required: true },
  ride_status: {
    type: String,
    enum: rideStatus.status,
    default: "Not_Started",
  },
  creator: { type: String, ref: "User" },
  riders: [{ type: String, ref: "User" }],
  riderStatus: [
    {
      rider: { type: Mongoose.Schema.Types.ObjectId, ref: "User" },
      status: {
        type: String,
        enum: ["Verified", "Pending", "Rejected"],
        default: "Pending",
      },
    },
  ],
  luggage_type: String,
  carName: {
    type: String,
    trim: true,
  },
  carColor: {
    type: String,
    trim: true,
  },
  carNumber: {
    type: String,
    trim: true,
  },
});

// add compound indexes
rideSchema.index({ "origin.location": "2dsphere" });
rideSchema.index({ "destination.location": "2dsphere" });

// add plugin that converts mongoose to json
rideSchema.plugin(toJSON);
rideSchema.plugin(paginate);

/**
 * @typedef Rides
 */
const Rides = Mongoose.model("Rides", rideSchema);

export default Rides;
