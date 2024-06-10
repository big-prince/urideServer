import Mongoose from "mongoose";
import toJSON from "../../plugins/toJSON.plugin.js";
import paginate from "../../plugins/paginate.plugin.js";

let ObjectId = Mongoose.Types.ObjectId;

const rideSchema = new Mongoose.Schema({
  origin: {
    name: { type: String, required: false },
    location: {
      type: {
        type: String, // This should be String
        enum: ["Point"], // 'Point' is the only allowed value
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
  },
  destination: {
    name: { type: String, required: false },
    location: {
      type: {
        type: String, // This should be String
        enum: ["Point"], // 'Point' is the only allowed value
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
  },
  departure_time: { type: Date, required: true },
  total_capacity: { type: Number, required: true },
  remaining_capacity: { type: Number, required: true },
  creator: { type: String, ref: "userSchema" },
  riders: [{ type: ObjectId, ref: "userSchema" }],
  luggage_type: String,
  transport: String,
});

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
