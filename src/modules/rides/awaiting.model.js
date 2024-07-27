import Mongoose from "mongoose";
import User from "../users/user.model.js";

const AwaitingRideSchema = new Mongoose.Schema({
  driverId: {
    type: Mongoose.Schema.Types.ObjectId,
    ref: "Driver",
    required: true,
  },
  rideId: {
    type: Mongoose.Schema.Types.ObjectId,
    ref: "Ride",
  },
  users: [
    {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

const Awaiting = Mongoose.model("Awaiting", AwaitingRideSchema);

export default Awaiting;
