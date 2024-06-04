import Mongoose from "mongoose";
import User from "../users/user.model.js";
import Rides from "./ride.model.js";
import Reviews from "../reviews/review.model.js";
import Logger from "../../config/logger.js";
import getCordinates from "../../utils/geocode.js";

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
    // .populate("creator", "email");

    if (!rides) {
      console.log("No Ridess");
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
        creator,
        riders,
        luggage_type,
        transport,
      } = ride;

      //find creator details using creator
      const userDetails = await User.findOne({ email: creator });

      // Format the ride object with additional creator details
      rideArray.push({
        id: _id,
        origin,
        destination,
        departure_time,
        total_capacity,
        remaining_capacity,
        creator: {
          firstName: userDetails.firstName,
          lastName: userDetails.lastName,
          email: userDetails.email,
        },
        riders,
        luggage_type,
        transport,
      });
    }
    console.log(rideArray);

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
    departure_time,
    total_capacity,
    creator,
    riders,
    luggage_type,
    transport,
  } = rideDetails;

  //get cordinates
  const originCordinates = await getCordinates(origin.name);
  const destinationCordinates = await getCordinates(destination.name);

  const MainOrigin = {
    type: "Point",
    coordinates: originCordinates,
  };
  const MainDestination = {
    type: "Point",
    coordinates: destinationCordinates,
  };

  //clean location
  const cleanLocation = (locationObject) => {
    return {
      ...locationObject,
      _id: undefined, // Remove or set to null
    };
  };
  const cleanOriginlocation = cleanLocation(MainOrigin);
  const cleanDestinationLocation = cleanLocation(MainDestination);

  const finalOrigin = {
    name: origin.name,
    location: MainOrigin,
  };
  const finalDestination = {
    name: destination.name,
    location: MainDestination,
  };
  Logger.info(`${origin.name}: ` + JSON.stringify(MainOrigin));
  Logger.info(`${destination.name}: ` + JSON.stringify(MainDestination));

  const options = {
    origin: finalOrigin,
    destination: finalDestination,
    departure_time: departure_time,
    total_capacity: total_capacity,
    remaining_capacity: total_capacity,
    creator: creator,
    riders: [],
    luggage_type: luggage_type,
    transport: transport,
  };

  // test ride
  // const testRide = {
  //   origin: {
  //     name: "Port Harcourt",
  //     location: {
  //       type: "Point",
  //       coordinates: [7.018569, 4.766129],
  //     },
  //   },
  //   destination: {
  //     name: "Eneka",
  //     location: {
  //       type: "Point",
  //       coordinates: [7.2556619, 4.5085784], // Adjusted to be realistic
  //     },
  //   },
  //   departure_time: new Date(),
  //   total_capacity: 4,
  //   remaining_capacity: 4,
  //   creator: "60d0fe4f5311236168a109ca",
  //   luggage_type: "Small",
  //   transport: "Car",
  // };

  try {
    const ride = await Rides.create(options);
    console.log("Ride created", ride);
    if (!ride) {
      return callback({ message: "Ride not created" });
    }
    //update the user part
    const userRides = await User.findOneAndUpdate(
      { email: creator },
      { $set: { rides: ride._id } },
      { new: true }
    );
    console.log(userRides);
    return ride;
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
