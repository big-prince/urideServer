import Mongoose from "mongoose";
import { sendSecurityCodeEmail } from "../com/emails/email.service.js";
import User from "../users/user.model.js";
import Ride from "../rides/ride.model.js";
import logger from "../../config/logger.js";
import { format } from "date-fns";

const codeSchema = new Mongoose.Schema({
  userID: {
    type: String,
    required: true,
    ref: "User",
  },
  driverID: {
    type: String,
    required: true,
    ref: "User",
  },
  rideID: {
    type: String,
    required: true,
    ref: "Ride",
  },
  code: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

codeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

codeSchema.pre("save", async function (next) {
  console.log("New code saved to database");

  // Only send an email when a new document is created
  if (this.isNew) {
    let usersID = this.userID;
    const userEmail = await User.findById({
      _id: usersID,
    });
    const mainUserEmail = userEmail.email;
    console.log(mainUserEmail);

    const driverEmail = await User.findById({
      _id: this.driverID,
    });
    const mainDriverEmail = driverEmail.email;
    console.log(mainDriverEmail);

    const ride = await Ride.findOne({
      _id: this.rideID,
    });
    //construct date
    console.log(ride.departure_time);
    const departureTime = ride.departure_time;
    const formattedTime = format(
      departureTime,
      "EEEE, MMMM do, yyyy 'at' hh:mm a"
    );
    console.log(formattedTime);

    const rideDetails = {
      driver: ride.creator,
      departure_time: formattedTime,
      destination: ride.destination,
      origin: ride.origin,
      price: ride.price,
    };
    logger.info();
    // console.log(mainUserEmail, mainDriverEmail, rideDetails, "THe thing");
    // console.log(this.code);
    await sendSecurityCodeEmail(mainUserEmail, this.code, rideDetails);
  }
  next();
});
/**
 * @typedef Token
 */
const CODE = Mongoose.model("CODE", codeSchema);

export default CODE;
