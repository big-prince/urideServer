import Mongoose from "mongoose";
import User from "../users/user.model.js";
import Rides from "./ride.model.js";
import Reviews from "../reviews/review.model.js";
import Logger from "../../config/logger.js";
import getCordinates from "../../utils/geocode.js";
import moment from "moment";

const { ObjectId } = Mongoose;

// Returns all rides in the ride schema
const getAllRides = async (callback) => {
  try {
    const result = await Rides.find({});
    if (result.length === 0) {
      console.log("No rides");
    }
    console.log(result);
    return result;
  } catch (error) {
    console.log(error);
  }
};

// Checks if a user exists in a ride given IDs
const inRide = function (userId, rideId, callback) {
  Rides.findById(rideId, function (err, ride) {
    if (err) {
      callback(err, null);
    } else if (!ride) {
      callback({ msg: "Invalid ride" });
    } else {
      var riders = ride.riders;
      callback(null, riders.indexOf(userId));
    }
  });
};

// Gets all rides with remaining capacity
const getAllOpenRides = function (callback) {
  let now = new Date();
  Rides.find({})
    .where("remaining_capacity")
    .gte(1)
    .where("departure_time")
    .gte(now)
    .exec(function (err, rides) {
      if (err) {
        callback(err);
      } else {
        callback(null, rides);
      }
    });
};

// Gets all rides with remaining capacity in a certain Location
const getAllOpenRidesWithLocation = async function (rideDetails, callback) {
  const { origin, destination } = rideDetails;
  Logger.info(rideDetails);

  // async function clearIndexes() {
  //   try {
  //     // Drop all indexes for the Rides collection
  //     await Rides.collection.dropIndexes();
  //     Logger.info("All indexes dropped for Rides collection.");
  //   } catch (error) {
  //     Logger.info("Error dropping indexes:", error);
  //     throw error; // Throw the error to handle it elsewhere, if needed
  //   }
  // }
  // clearIndexes();
  //get the cordinates of the input
  const originCordinates = await getCordinates(origin);
  const destinationCordinates = await getCordinates(destination);

  const mainOrigin = {
    type: "Point",
    coordinates: originCordinates,
  };
  const mainDestination = {
    type: "Point",
    coordinates: destinationCordinates,
  };

  const finalOrigin = {
    location: mainOrigin,
    name: origin,
  };
  Logger.info(
    `Origin: ${origin}, ${originCordinates}, ${JSON.stringify(finalOrigin)}`
  );
  Logger.info(
    `Destination: ${destination}, ${destinationCordinates}, ${JSON.stringify(
      mainDestination
    )}`
  );

  const distInRadians = 25 / 3963.2; //converts the distance from miles to radians by dividing by the approximate equatorial radius of the earth

  const now = new Date();

  const query = {
    origin: {
      $geoWithin: {
        $centerSphere: [mainOrigin.coordinates, distInRadians],
      },
    },
  };
  try {
    const rides = await Rides.find({
      origin: finalOrigin,
    })
      .where("remaining_capacity")
      .gte(1)
      .where("departure_time")
      .gte(now);
    Logger.info(`Rides: ${JSON.stringify(rides)}`);
    if (!rides) {
      Logger.info(`No rides found for ${origin} and ${destination}`);
      return callback({ message: "No rides found" });
    }

    // Initialize an array to store the formatted rides with creator details
    const rideArray = [];

    // Iterate over the rides array and fetch additional creator details
    for (const ride of rides) {
      const {
        _id,
        origin,
        destination,
        departure_time,
        total_capacity,
        remaining_capacity,
        brs,
        stops,
        creator,
        price,
        riders,
        luggage_type,
        carName,
        carNumber,
        type,
        other,
      } = ride;

      // Fetch additional details of the creator using the email
      const creatorDetails = await User.findOne({
        email: ride.creator,
      });

      if (creatorDetails.role !== "passenger") {
        //switch role to driver
        creatorDetails.role = "passenger";
        await creatorDetails.save().then(() => {
          console.log("Role Changed to Passenger!");
        });
      }

      // Format the ride object with additional creator details
      rideArray.push({
        id: _id,
        origin,
        destination,
        departure_time,
        total_capacity,
        remaining_capacity,
        brs,
        stops,
        creator: {
          email: creatorDetails.email,
          name: {
            firstName: creatorDetails.firstName,
            lastName: creatorDetails.lastName,
          },
        },
        price,
        riders,
        luggage_type,
        carName,
        carNumber,
        type,
        other,
      });
    }

    // Return the formatted ride array
    return rideArray;
  } catch (error) {
    return callback(error);
  }
  // Rides.find({
  //   origin: { $geoWithin: { $centerSphere: [areaOneOrigin, distInRadians] } },
  //   destination: {
  //     $geoWithin: { $centerSphere: [wuseDestination, distInRadians] },
  //   },
  // })
  //   .where("remaining_capacity")
  //   .gte(1)
  //   .where("departure_time")
  //   .gte(now)((err, rides) => {
  //   //processing query results here
  //   if (err) {
  //     callback(err);
  //   } else {
  //     callback(null, rides);
  //   }
  // });

  // Rides
  //     .find({})
  //     .where("longitude")
  //     .equals(longitude)
  //     .where("latitude")
  //     .equals(latitude)
  //     .where("remaining_capacity")
  //     .gte(1)
  //     .where("departure_time")
  //     .gte(now)
  //     .exec(function (err, rides) {
  //         if (err) {
  //             callback(err);
  //         } else {
  //             callback(null, rides);
  //         }
  //     });
};

// Returns a ride given the id
const getRide = function (rideId, callback) {
  Rides.findById(rideId, function (err, ride) {
    if (err) {
      callback(err);
    } else if (!ride) {
      callback({ msg: "Invalid ride." });
    } else {
      callback(null, ride);
    }
  });
};

// Adds a ride given the user inputs
const addRide = async function (rideDetails, callback) {
  const {
    origin,
    destination,
    stops,
    type,
    other,
    price,
    brs,
    departure_time,
    total_capacity,
    creator,
    riders,
    luggage_type,
    carName,
    carColor,
    carNumber,
  } = rideDetails;

  Logger.info(
    `Ride Details: ${origin}, ${destination}, ${stops}, ${type}, ${other}, ${price}, ${brs}, ${departure_time}, ${total_capacity}, ${creator}, ${riders}, ${luggage_type}, ${carName}, ${carColor}, ${carNumber}`
  );
  //check creators role
  const creatorRole = await User.findOne({ email: creator });
  if (!creatorRole) {
    return callback({ message: "User not found" });
  }
  if (creatorRole.role !== "driver") {
    //switch role to driver
    creatorRole.role = "driver";
    await creatorRole.save().then(() => {
      console.log("Role Changed to Driver!");
    });
  }
  Logger.info(creatorRole);

  //get cordinates
  const originCordinates = await getCordinates(origin);
  const destinationCordinates = await getCordinates(destination);
  //destruxture date function
  function parseDateWithMoment(dateString) {
    // Parse the date string using moment with a specific format
    const parsedDate = moment(dateString, "M/D/YYYY h:mmA");

    // Check if the parsed date is valid
    if (!parsedDate.isValid()) {
      console.log("Invalid date format");
    }

    // Return a JavaScript Date object
    return parsedDate.toDate();
  }

  const MainOrigin = {
    type: "Point",
    coordinates: originCordinates,
  };
  const MainDestination = {
    type: "Point",
    coordinates: destinationCordinates,
  };

  const finalOrigin = {
    name: origin,
    location: MainOrigin,
  };
  const finalDestination = {
    name: destination,
    location: MainDestination,
  };

  const formattedStops = await Promise.all(
    stops.map(async (stop) => {
      const coordinates = await getCordinates(stop);
      return {
        name: stop,
        location: {
          type: "Point",
          coordinates: coordinates,
        },
      };
    })
  );
  //destructure the time received
  const departureTime = parseDateWithMoment(departure_time);
  console.log(departureTime);

  Logger.info(`${origin.name}: ` + JSON.stringify(MainOrigin));
  Logger.info(`${destination.name}: ` + JSON.stringify(MainDestination));
  Logger.info(`Stops: ` + JSON.stringify(formattedStops));

  const options = {
    origin: finalOrigin,
    destination: finalDestination,
    stops: formattedStops,
    type: type,
    other: other,
    price: price,
    brs: brs,
    departure_time: departureTime,
    total_capacity: total_capacity,
    remaining_capacity: total_capacity,
    creator: creator,
    riders: riders,
    luggage_type: luggage_type,
    carName: carName,
    carColor: carColor,
    carNumber: carNumber,
  };

  try {
    //only save if ride is "One-Time"
    if (type === "One-time") {
      const ride = await Rides.create(options);
      Logger.info(`Ride created: ${ride.id}`);
      if (!ride) {
        Logger.info("Ride not created");
        return callback({ message: "Ride not created" });
      }
      // update the creators rides
      const updateDriver = await User.findOneAndUpdate(
        { email: creator },
        {
          $push: { ridesCreated: ride._id },
          carName: carName,
          carNumber: carNumber,
        },
        { new: true }
      );

      //update car details for driver
      Logger.info("Everything done..");
      return ride;
    }
  } catch (error) {
    console.log("There is an error", { message: error.message });
  }
};
//get allrides creataed  by driver(manage rides)
const driverRides = async function (email, callback) {
  const driverRides = await User.findOne({ email: email.email });
  // //check for driver role
  if (!driverRides) {
    Logger.info("NO user found");
    return callback({ message: "User Found" });
  }
  //check role
  if (driverRides.role !== "driver") {
    //switch role to driver
    driverRides.role = "driver";
    await driverRides.save().then(() => {
      Logger.info("Role Changed to Driver!");
    });
  }
  const ridesCreated = driverRides.ridesCreated;

  const rides = await Rides.find({ _id: { $in: ridesCreated } });
  if (!rides) {
    return callback({ message: "No rides found" });
  }
  Logger.info("Rides FOund...");

  let FinalResult = [];
  try {
    for (const ride of rides) {
      let {
        origin,
        _id,
        destination,
        departure_time,
        total_capacity,
        remaining_capacity,
        brs,
        stops,
        creator,
        price,
        riders,
        luggage_type,
      } = ride;

      let ridersDetails = [];
      if (ride.riders.length != 0) {
        const riders = await User.find({ _id: { $in: ride.riders } });
        riders.map(({ email, firstName, lastName, role, _id }) => {
          ridersDetails.push({
            email,
            firstName,
            lastName,
            role,
            _id,
          });
        });
        Logger.info("Rider details found and mapped.");
      }

      const options = {
        origin,
        destination,
        departure_time,
        total_capacity,
        remaining_capacity,
        brs,
        stops,
        creator,
        price,
        riders,
        luggage_type,
        mainID: _id,
        riders: ridersDetails,
      };
      Logger.info("Options found and mapped.");
      FinalResult.push(options);
    }
  } catch (error) {
    Logger.info("Error in mapping riders details");
  }
  Logger.info("Everything worked Perfectly..");
  return FinalResult;
};

// Gets the riders in a ride given the ride ID
const getRiders = function (rideId, callback) {
  Rides.findById(rideId, function (err, ride) {
    if (err) {
      callback(err, null);
    } else {
      var riderIds = ride.riders;
      User.find({ _id: { $in: riderIds } }, function (err, riders) {
        callback(err, riders);
      });
    }
  });
};

// gets the other riders in a ride besides the user
const getOtherRiders = function (rideId, userId, callback) {
  getRiders(rideId, function (err, riders) {
    let user_id = ObjectId(userId);
    var other_riders = riders.filter(function (rider) {
      return !user_id.equals(rider._id);
    });
    var other_riders_copy = other_riders.slice(0);
    var other_riders_reviews = [];
    (function next() {
      if (!other_riders_copy.length) {
        return callback(null, other_riders, other_riders_reviews);
      }
      var other_rider = other_riders_copy.shift();
      Reviews.find(
        {
          ride: rideId,
          reviewer: userId,
          reviewee: other_rider._id,
        },
        function (err, review) {
          if (err) {
            return callback(err);
          } else {
            if (review.length > 0) {
              other_riders_reviews.push(review[0]);
            } else {
              other_riders_reviews.push(null);
            }
            next();
          }
        }
      );
    })();
  });
};

// Adds a rider to a ride given their respective IDs
const addRider = async function (details, callback) {
  const { rideId, riderId } = details;

  const now = new Date();
  //check if ride exists
  const exists = await Rides.findOne({ _id: rideId })
    .where("departure_time")
    .gte(now);
  if (!exists) {
    Logger.info("No Ride found");
    return callback({ message: "Ride not found" });
  }

  //check if rider exists
  const rider = await User.findOne({ _id: riderId });
  if (!rider) {
    Logger.info("No rider found");
    return callback({ message: "User not find" });
  }

  //check if the user is already in this Ride
  const currentRiders = exists.riders;
  const tIndex = currentRiders.indexOf(riderId);
  if (tIndex > -1) {
    Logger.info("User already in this ride");
    return callback({ message: "User already in this ride" });
  }

  //check if the user is already in a ride
  if (rider.rides.length != 0) {
    Logger.info("User already in ride..");
    return callback({ message: "User already in a ride.." });
  } else {
    console.log("User not in a ride.");
  }

  //check if the ride is filled up
  const remC = exists.remaining_capacity;
  const totC = exists.total_capacity;
  if (remC == 0) {
    Logger.info("Ride is already filled up");
    return callback({ message: "Ride is filled up..." });
  } else {
    Logger.info(`Ride is not filled. Remaining Capacity:${remC}`);
  }

  //add the user to the riders array of the ride and decrement remaining_capacity
  currentRiders.push(riderId);
  exists.remaining_capacity = remC - 1;
  await exists.save().then(() => {
    Logger.info("Rider added to Ride Array.");
    console.log("Done");
  });

  //add the ride to the riders rides.
  const currentUserRide = rider.rides;
  currentUserRide.push(rideId);
  await rider.save().then(() => {
    Logger.info("Ride added to User array");
    console.log("Done", "User Part");
  });

  const message = {
    message: "User Succesfully added to ride",
    remaining_capacity: exists.remaining_capacity,
    total_capacity: totC,
    rideID: rideId,
    riderID: riderId,
    rideDetails: {
      origin: exists.origin,
      destination: exists.destination,
      stops: exists.stops,
    },
  };

  return message;
};

// Removes a rider from a ride given their respective IDs
const removeRider = async function (details, callback) {
  const { rideId, riderId } = details;

  //check if ride exists
  const exist = await Rides.findOne({ _id: rideId });
  if (!exist) {
    Logger.info("The ride doesnt exist");
    return callback({ message: "Ride doesnt exist" });
  }
  //check if rider exists
  const riderExist = await User.findOne({ _id: riderId });
  if (!riderExist) {
    Logger.info("The rider doesnt exist");
    return callback({ message: "Rider doesnt exist" });
  }

  //remove rideId from riderslist
  riderExist.rides = [];
  await riderExist.save().then(() => {
    Logger.info("Ride Removed From User, and user, not in any ride");
  });

  //remove riderId from the ride list
  const ridersList = exist.riders;
  console.log(ridersList.length);
  const index = ridersList.indexOf(riderId);
  if (index > -1) {
    ridersList.splice(index, 1);
    Logger.info("Rider Removed");
  }

  // increment remaining capacity
  const remC = exist.remaining_capcity;
  const totC = exists.total_capacity;
  if (remC >= totC) {
    Logger.info("Ride is already filled up");
    return callback({ message: "Ride is filled up..." });
  } else {
    exist.remaining_capcity = remC + 1;
    Logger.info(`Ride is not filled. Remaining Capacity:${remC}`);
  }

  await exist.save({}).then(() => {
    Logger.info("Rider Removed and  Remaining Capacity Incremented.");
  });

  //check if the ride is now empty
  if ((ridersList.length = 0)) {
    deleteRide({ id: rideId });
  }

  const message = "Rider removed Sucessfully";
  Logger.info(message);
  return message;
};

// Deletes a ride from the ride schema
const deleteRide = async function (rideId, callback) {
  console.log(rideId);
  //find the ride
  const exist = await Rides.findById({ _id: rideId.id });
  if (!exist) {
    Logger.info("The ride doesnt exist");
    return callback({ message: "Ride doesnt exist" });
  }

  //clear the ride from the riders' rides
  const riders = exist.riders;
  if (riders.length != 0) {
    for (const rider of riders) {
      const riderExist = await User.findOne({ _id: rider });
      if (!riderExist) {
        Logger.info("The rider doesnt exist");
        return callback({ message: "Rider doesnt exist" });
      }

      // remove rideId from riderslist
      riderExist.rides = [];
      await riderExist.save().then(() => {
        Logger.info("Ride Removed From User, and user, not in any ride");
      });
    }
  }
  //clear the riders in the ride
  exist.riders = [];
  await exist
    .save({
      validateBeforeSave: false,
    })
    .then(() => {
      Logger.info("Riders Cleared");
    });

  //find the creator and pop it off his array
  const creator = await User.findOne({ email: exist.creator });
  if (!creator) {
    Logger.info("The creator doesnt exist");
    return callback({ message: "Creator doesnt exist" });
  }

  //pop this ride out of ride Created
  const rideCreated = creator.ridesCreated;
  const index = rideCreated.indexOf(rideId.id);
  if (index > -1) {
    rideCreated.splice(index, 1);
    Logger.info("Ride Removed");
  }
  //save the creator
  await creator.save().then(() => {
    Logger.info("Ride removed from creator");
  });

  //delete the ride
  await Rides.findByIdAndDelete(rideId.id).then(() => {
    Logger.info("Ride Deleted");
  });
  const message = "Ride deleted Sucessfully";
  Logger.info(message);
  return message;
};

export default {
  getAllOpenRides,
  getAllRides,
  getAllOpenRidesWithLocation,
  getOtherRiders,
  getRide,
  inRide,
  getRiders,
  addRide,
  addRider,
  driverRides,
  deleteRide,
  removeRider,
};
