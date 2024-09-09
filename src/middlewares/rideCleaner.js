import cron from "node-cron"; // Import the node-cron package
import Rides from "../modules/rides/ride.model.js"; // Import the Ride model
import rideService from "../modules/rides/ride.service.js";
import User from "../modules/users/user.model.js";
import Logger from "../config/logger.js";
console.log("Starting ride cleaner cron job");

// Schedule a task to run every minute
cron.schedule("* * * * *", async () => {
  console.log("Cron job running: Checking for expired rides...");

  try {
    const now = new Date();
    // Find expired rides (rides with past departure time)
    const expiredRides = await Rides.find()
      .where("departure_time")
      .lt(now)
      .where("ride_status")
      .equals("Not_Started");

    console.log(`Found ${expiredRides.length} expired rides.`);

    if (expiredRides.length > 0) {
      for (let ride of expiredRides) {
        console.log(`Deleting ride with ID: ${ride._id}`);
        // check the ride status

        // clear the ride from the riders' rides
        const riders = ride.riders;
        if (riders.length != 0) {
          for (const rider of riders) {
            const riderExist = await User.findOne({ _id: rider });
            if (!riderExist) {
              Logger.info("The rider doesnt exist");
              throw new Error("Rider doesnt exist");
            }

            // remove rideId from riderslist
            riderExist.rides = [];
            await riderExist.save().then(() => {
              Logger.info("Ride Removed From User, and user, not in any ride");
            });
          }
        }

        //clear the riders in the ride
        ride.riders = [];
        await ride
          .save({
            validateBeforeSave: false,
          })
          .then(() => {
            Logger.info("Riders Cleared");
          });

        //find the creator and pop it off his array
        const creator = await User.findOne({ email: ride.creator });
        if (!creator) {
          Logger.info("The creator doesnt exist");
          throw new Error({ message: "Creator doesnt exist" });
        }

        //pop this ride out of ride Created
        const rideCreated = creator.ridesCreated;
        const index = rideCreated.indexOf(ride._id);
        if (index > -1) {
          rideCreated.splice(index, 1);
          Logger.info("Ride Removed");
        }
        //save the creator
        await creator.save().then(() => {
          Logger.info("Ride removed from creator");
        });

        //delete the ride
        await Rides.findByIdAndDelete(ride._id).then(() => {
          Logger.info("Ride Deleted");
        });
        const message = "Ride deleted Sucessfully";
        Logger.info(message);
      }
    } else {
      console.log("No expired rides found at this time.");
    }
  } catch (error) {
    console.error("Error while deleting expired rides:", error);
  }
});
