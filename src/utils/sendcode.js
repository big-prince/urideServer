import { sendSecurityCodeEmail } from "../modules/com/emails/email.service.js";
import Ride from "../modules/rides/ride.model.js";
import logger from "../config/logger.js";
import { format } from "date-fns";
import { Logger } from "winston";

//code Sending function
const sendCode = async (code, userEmail, driverEmail, rideId) => {
  try {
    //find ride
    const ride = await Ride.findOne({
      _id: rideId,
    });
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
    console.log(rideDetails, userEmail, code);

    //send code email
    await sendSecurityCodeEmail(userEmail, code, rideDetails);

    logger.info("SendCOde function DOne");
  } catch (error) {
    logger.info("Code not Sent to User");
    console.log(error);
  }
};

export default sendCode;
