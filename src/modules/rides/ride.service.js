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
const addRider = function (rideId, riderId, callback) {
  // checks if ride is full
  Rides.findById(rideId, function (err, ride) {
    if (!ride) {
      callback({ msg: "Invalid ride." });
    } else if (ride.remaining_capacity === 0) {
      callback({ msg: "ride full" });
    } else {
      Rides.findByIdAndUpdate(
        rideId,
        { $inc: { remaining_capacity: -1 } },
        function (err, result) {
          Rides.findByIdAndUpdate(
            rideId,
            { $push: { riders: riderId } },
            function (err, result) {
              if (err) {
                callback(err);
              } else {
                User.findByIdAndUpdate(
                  riderId,
                  {
                    $push: {
                      rides: rideId,
                    },
                  },
                  function (err, result) {
                    if (err) {
                      callback(err, null);
                    } else {
                      callback(null, null);
                    }
                  }
                );
              }
            }
          );
        }
      );
    }
  });
};

// Removes a rider from a ride given their respective IDs
const removeRider = function (rideId, riderId, callback) {
  Rides.findByIdAndUpdate(
    rideId,
    { $inc: { remaining_capacity: 1 } },
    function (err, result) {
      if (err) {
        callback(err, null);
      } else {
        Rides.findByIdAndUpdate(
          rideId,
          { $pull: { riders: ObjectId(riderId) } },
          function (err, result) {
            if (err) {
              callback(err);
            } else {
              User.findByIdAndUpdate(
                riderId,
                {
                  $pull: {
                    rides: ObjectId(rideId),
                  },
                },
                function (err, result) {
                  if (err) {
                    callback(err, null);
                  } else {
                    //delete ride if no more riders
                    Rides.findById(rideId, function (err, ride) {
                      if (ride.remaining_capacity === ride.total_capacity) {
                        deleteRide(rideId, function (err) {
                          if (err) {
                            callback(err, null);
                          } else {
                            callback(null, null);
                          }
                        });
                      } else {
                        if (ride.creator === riderId) {
                          Rides.findByIdAndUpdate(
                            rideId,
                            {
                              $set: {
                                creator: undefined,
                              },
                            },
                            function (err, result) {
                              if (err) {
                                callback(err, null);
                              } else {
                                callback(null, null);
                              }
                            }
                          );
                        } else {
                          callback(null, null);
                        }
                      }
                    });
                  }
                }
              );
            }
          }
        );
      }
    }
  );
};

// Deletes a ride from the ride schema
const deleteRide = function (rideId, callback) {
  Rides.findByIdAndRemove(rideId, function (err) {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
};

export default {
  getAllOpenRides,
  getAllRides,
  getAllOpenRidesWithLocation,
  getOtherRiders,
  getRide,
  getRiders,
  addRide,
  addRider,
  deleteRide,
  inRide,
  removeRider,
};
