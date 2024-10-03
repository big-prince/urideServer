import Mongoose from "mongoose";
//models
import User from "../users/user.model.js";
import Rides from "./ride.model.js";
import Wallet from "../wallet/wallet.model.js";
import CODE from "./securityCode.model.js";
import TransactionHistory from "../wallet/transactionHistory.model.js";
import Awaiting from "./awaiting.model.js";
import Reviews from "../reviews/review.model.js";

//usefiles
import codeGenerator from "../../utils/codeGenerator.js";
import clearIndex from "../../utils/clearIndex.js";
import Logger from "../../config/logger.js";
// import getCordinates from "../../utils/geocode.js";
import getCordinates from "../../utils/geocode.google.js";
import geoDistance from "../../utils/geoDistance.js";
import sendCode from "../../utils/sendcode.js";
import deleteAllDocuments from "../../middlewares/deleteCollection.js";
import moment from "moment";
import { format } from "date-fns";
import logger from "../../config/logger.js";

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
          id: creatorDetails._id,
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
  console.log("Got to this point");

  //get cordinates
  const originCordinates = await getCordinates(origin);
  console.log("🚀 ~ addRide ~ originCordinates:", originCordinates);

  const destinationCordinates = await getCordinates(destination);
  console.log("🚀 ~ addRide ~ destinationCordinates:", destinationCordinates);

  //destruxture date function
  function parseDateWithMoment(dateString) {
    // Parse the date string using moment with a specific format
    const parsedDate = moment(dateString, "M/D/YYYY h:mmA");

    // Check if the parsed date is valid
    if (!parsedDate.isValid()) {
      console.log("Invalid date format");
    }

    return parsedDate.toDate();
  }
  console.log(originCordinates.lat);
  const MainOrigin = {
    type: "Point",
    coordinates: [originCordinates.lat, originCordinates.lng],
  };
  const MainDestination = {
    type: "Point",
    coordinates: [destinationCordinates.lat, destinationCordinates.lng],
  };

  const finalOrigin = {
    name: origin,
    location: MainOrigin,
  };
  const finalDestination = {
    name: destination,
    location: MainDestination,
  };

  console.log(finalOrigin, finalDestination);

  const formattedStops = await Promise.all(
    stops.map(async (stop) => {
      const coordinates = await getCordinates(stop);
      return {
        name: stop,
        location: {
          type: "Point",
          coordinates: [coordinates.lat, coordinates.lng],
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
  console.log(options);

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

      // //create a waiting list for that ride
      // const awaiting = {
      //   driverId: updateDriver._id,
      //   rideId: ride._id,
      //   users: [],
      // };
      // await Awaiting.create(awaiting).then(() => {
      //   Logger.info("Awaiting list created");
      // });

      //generate security code for the ride
      const code = await codeGenerator(
        creatorRole._id,
        ride._id,
        ride.departure_time
      ).then(() => {
        Logger.info("Code Generated for Ride.");
      });

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
  const now = new Date();
  const rides = await Rides.find({
    _id: { $in: ridesCreated },
    departure_time: { $gte: now },
  });
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
      var riderIds = ride.riders.user;
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
  const { price, rideId, riderId } = details;

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
  //find creator details
  const creator = await User.findOne({ email: exists.creator });
  if (!creator) {
    Logger.info("The creator doesnt exist");
    return callback({ message: "Creator doesnt exist" });
  } else {
    Logger.info("Creator Exists");
  }

  //check if the user is already in this Ride
  const currentRiders = exists.riders;
  const tIndex = currentRiders.indexOf(riderId);
  if (tIndex > -1) {
    Logger.info("User already in this ride");
    throw new Error({ message: "User already in this ride" });
  }

  //check if the user is already in a ride
  if (rider.rides.length != 0) {
    Logger.info("User already in ride..");
    //get the ride details
    console.log(rider.rides[0]);
    const ride = await Rides.findOne({ _id: rider.rides[0] });
    if (!ride) {
      Logger.info("Existing Ride, doesnt exist");
      //delete id from the user list
      rider.rides = [];
      await rider.save().then(() => {
        Logger.info("Ride Removed From User, and user, not in any ride");
      });
    } else {
      Logger.info("Existing Ride, exists");
      throw new Error(`User in ride ${ride._id}`);
    }
  } else {
    Logger.info("User not in ride..");
  }

  //check if the ride is filled up
  const remC = exists.remaining_capacity;
  const totC = exists.total_capacity;
  console.log(remC, totC);
  if (remC == 0) {
    Logger.info("Ride is already filled up");
    return callback({ message: "Ride is filled up..." });
  } else {
    Logger.info(`Ride is not filled. Remaining Capacity:${remC}`);
  }

  //search for the users wallet
  const userWallet = await Wallet.findOne({ userId: riderId });
  const creatorWallet = await Wallet.findOne({ userId: creator._id });
  if (!userWallet) {
    Logger.info("The wallet doesnt exist");
    return callback({ message: "Wallet doesnt exist" });
  } else {
    Logger.info("Wallet exists");
    Logger.info(creatorWallet);
  }
  //check if the amount equals the ride price
  if (price !== exists.price) {
    Logger.info("Price doesnt match");
    return callback({ message: "Price doesnt match" });
  } else {
    Logger.info("Price matches");
  }
  //deduct amount from user-balance
  const balance = userWallet.balance;
  if (balance < price) {
    Logger.info("Insufficient funds");
    return callback({ message: "Insufficient funds" });
  }
  userWallet.balance = balance - price;
  await userWallet.save().then(() => {
    Logger.info("Amount deducted from wallet");
  });

  async function clearIndexes() {
    try {
      // Drop all indexes for the Rides collection
      await TransactionHistory.collection.dropIndexes();
      Logger.info("All indexes dropped for this collection.");
    } catch (error) {
      Logger.info("Error dropping indexes:", error); // Throw the error to handle it elsewhere, if needed
    }
  }
  clearIndexes();

  //record transacion history
  const transaction = {
    userId: riderId,
    data: {
      reference: "ref_local",
      amount: price,
      status: "success",
      currency: "NGN",
      transactionDate: new Date(),
      gatewayResponse: "Successful Local Transaction",
    },
    transactionType: "debit",
  };
  await TransactionHistory.create(transaction).then(() => {
    Logger.info("Transaction History recorded");
  });

  //add the amount to the driver wallet balance
  //check if the creator balance exists
  const creatorBalance = creatorWallet.balance;
  creatorWallet.balance = creatorBalance + price;
  await creatorWallet.save().then(() => {
    Logger.info("Amount added to creator wallet");
  });
  //sve thistory for creator
  const creatorTransaction = {
    userId: creator._id,
    data: {
      reference: "ref_local",
      amount: price,
      status: "success",
      currency: "NGN",
      transactionDate: new Date(),
      gatewayResponse: "Successful Local Transaction",
    },
    transactionType: "credit",
  };
  await TransactionHistory.create(creatorTransaction).then(() => {
    Logger.info("Transaction History recorded for creator");
  });

  //add the user to the riders array of the ride(with status) and decrement remaining_capacity
  exists.riders.push(riderId);
  const status = {
    rider: riderId,
    status: "Pending",
  };
  exists.riderStatus.push(status);
  exists.remaining_capacity -= 1;
  await exists.save().then(() => {
    Logger.info("User added to ride");
  });

  //verifyer
  console.log({
    remainingCapacity: exists.remaining_capacity,
    ridersStatusLength: exists.riderStatus.length,
    ridersLength: exists.riders.length,
  });

  //add the ride to the riders rides
  const currentUserRide = rider.rides;
  currentUserRide.push(rideId);
  await rider.save().then(() => {
    Logger.info("Ride added to User array");
    console.log("Done", "User Part");
  });

  //codeLogic to send rides code to user
  const rideCode = await CODE.findOne({ rideID: exists.id });
  if (!rideCode) {
    Logger.info("No code for this ride");
    return callback({ message: "Code not found" });
  }
  await sendCode(rideCode.code, rider.email, creator.email, rideId).then(() => {
    Logger.info("Ride code sent to user");
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
    codeStatus: "Code sent to users Email",
  };

  return message;
};

// Removes a rider from a ride given their respective IDs
const removeRider = async function (details, callback) {
  const { rideId, riderId } = details;
  console.log(rideId);
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

  //remove riderId from the ride list using pull
  exist.riders.pull(riderId);
  await exist.save().then(() => {
    Logger.info("Rider Removed From Ride");
  });
  //remove rider from the status list
  const ridersList = exist.riderStatus;
  await Rides.findByIdAndUpdate(
    rideId,
    { $pull: { riderStatus: { rider: riderId } } },
    { new: true }
  ).then(() => {
    Logger.info("Rider Removed From Status");
  });

  // increment remaining capacity
  exist.remaining_capacity += 1;
  await exist.save().then(() => {
    Logger.info("Ride Updated");
  });

  //verifyer
  console.log({
    remainingCapacity: exist.remaining_capacity,
    ridersStatusLength: ridersList,
    ridersLength: exist.riders.length,
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

//request to driver
const requestToDriver = async function (details, callback) {
  const { price, rideId, riderId } = details;

  //check if ride exists
  const exist = await Rides.findOne({ _id: rideId });
  if (!exist) {
    Logger.info("The ride doesnt exist");
    return callback({ message: "Ride doesnt exist" });
  } else {
    Logger.info("Ride Exists...");
  }
  //check if rider exists
  const riderExist = await User.findOne({ _id: riderId });

  //find rideCreator
  const creator = await User.findOne({ email: exist.creator });
  if (!creator) {
    Logger.info("The creator doesnt exist");
    return callback({ message: "Creator doesnt exist" });
  } else {
    Logger.info("Creator Exists");
    Logger.info(creator, "The Creator");
  }

  if (!riderExist) {
    Logger.info("The rider doesnt exist");
    return callback({ message: "Rider doesnt exist" });
  }

  //search for the users wallet
  const userWallet = await Wallet.findOne({ userId: riderId });
  const creatorWallet = await Wallet.findOne({ userId: creator._id });
  if (!userWallet) {
    Logger.info("The wallet doesnt exist");
    return callback({ message: "Wallet doesnt exist" });
  } else {
    Logger.info("Wallet exists");
    Logger.info(creatorWallet);
  }
  //check if the amount equals the ride price
  if (price !== exist.price) {
    Logger.info("Price doesnt match");
    return callback({ message: "Price doesnt match" });
  } else {
    Logger.info("Price matches");
  }
  //deduct amount from user-balance
  const balance = userWallet.balance;
  if (balance < price) {
    Logger.info("Insufficient funds");
    return callback({ message: "Insufficient funds" });
  }
  userWallet.balance = balance - price;
  await userWallet.save().then(() => {
    Logger.info("Amount deducted from wallet");
  });

  async function clearIndexes() {
    try {
      // Drop all indexes for the Rides collection
      await TransactionHistory.collection.dropIndexes();
      Logger.info("All indexes dropped for this collection.");
    } catch (error) {
      Logger.info("Error dropping indexes:", error); // Throw the error to handle it elsewhere, if needed
    }
  }
  clearIndexes();

  //record transacion history
  const transaction = {
    userId: riderId,
    data: {
      reference: "ref_local",
      amount: price,
      status: "success",
      currency: "NGN",
      transactionDate: new Date(),
      gatewayResponse: "Successful Local Transaction",
    },
    transactionType: "debit",
  };
  await TransactionHistory.create(transaction).then(() => {
    Logger.info("Transaction History recorded");
  });

  //add the amount to the driver wallet balance
  //check if the creator balance exists
  const creatorBalance = creatorWallet.balance;
  creatorWallet.balance = creatorBalance + price;
  await creatorWallet.save().then(() => {
    Logger.info("Amount added to creator wallet");
  });
  //sve thistory for creator
  const creatorTransaction = {
    userId: creator._id,
    data: {
      reference: "ref_local",
      amount: price,
      status: "success",
      currency: "NGN",
      transactionDate: new Date(),
      gatewayResponse: "Successful Local Transaction",
    },
    transactionType: "credit",
  };
  await TransactionHistory.create(creatorTransaction).then(() => {
    Logger.info("Transaction History recorded for creator");
  });

  //add user to awaiting model of the driver
  const awaiting = await Awaiting.findOne({ rideId: rideId });
  if (!awaiting) {
    Logger.info("The awaiting doesnt exist");
    return callback({ message: "Awaiting doesnt exist" });
  } else {
    Logger.info("Awaiting exists");
  }
  //check if the user is already in the list
  const users = awaiting.users;
  if (users.includes(riderId)) {
    Logger.info("User already in the list");
    return callback({ message: "User already in the list" });
  } else {
    Logger.info("User not in the list");
  }
  users.push(riderId);
  await awaiting.save().then(() => {
    Logger.info("User added to awaiting list");
  });

  const message = {
    message: "Request sent to driver",
    riderDetails: {
      name: riderExist.firstName + " " + riderExist.lastName,
      email: riderExist.email,
      id: riderExist._id,
    },
    rideDetails: {
      id: rideId,
      origin: exist.origin,
      destination: exist.destination,
    },
    price: price,
  };

  return message;
};

//start the ride
const startRide = async function (details, callback) {
  const { driverID, rideID } = details;
  console.log("🚀 ~ startRide ~ { driverID, rideID }:", { driverID, rideID });

  //check if driver exists
  const driver = await User.findOne({ _id: driverID });
  if (!driver) {
    Logger.info("The driver doesnt exist");
    return callback({ message: "Driver doesnt exist" });
  } else {
    Logger.info("Driver Exists...");
  }
  //check if ride exists
  const now = new Date();
  const exist = await Rides.findOne({
    _id: rideID,
    departure_time: { $gte: now },
    ride_status: "Not_Started",
  });
  if (!exist) {
    Logger.info("The ride doesnt exist");
    return callback({ message: "Ride doesnt exist" });
  } else {
    Logger.info("Ride Exists...");
  }

  //check driver role
  if (driver.role !== "driver") {
    //switch role to driver
    driver.role = "driver";
    await driver.save().then(() => {
      Logger.info("Role Changed to Driver!");
    });
  } else {
    Logger.info("Driver is a driver");
  }

  //check if rideID in drivers rideCreated
  const ridesCreated = driver.ridesCreated;
  const index = ridesCreated.indexOf(rideID);
  if (index < 0) {
    Logger.info("Ride not found in drivers rides");
    return callback({ message: "Ride not found in drivers rides" });
  } else {
    Logger.info("Ride Found in drivers rides");
  }

  //check if the time now matches the departure_time
  // const departureTime = exist.departure_time;
  // if (now.getTime() !== departureTime.getTime()) {
  //   Logger.info("Not yet departure_time");
  //   return callback({ message: "Ride not yet started" });
  // } else {
  //   Logger.info("Ride is to start");
  // }

  //check if the ride has remaining seats
  const remC = exist.remaining_capacity;
  const totC = exist.total_capacity;
  if (remC > 0) {
    Logger.info("Ride is not filled up");
    return callback({ message: "Ride is not filled up..." });
  } else {
    Logger.info("Ride is filled up");
  }

  //get distance between origin and destination
  const origin = exist.origin.location.coordinates;
  const destination = exist.destination.location.coordinates;
  let originCordinates = {
    lat: origin[0],
    lon: origin[1],
  };
  let destinationCordinates = {
    lat: destination[0],
    lon: destination[1],
  };
  const distance = geoDistance(exist.origin.name, exist.destination.name).then(
    (result) => {
      console.log("Distance", result);
    }
  );
  Logger.info("Distance Found");

  //change the status of the ride
  exist.ride_status = "Started";
  console.log("Changed");
  await exist.save().then(() => {
    Logger.info("Ride Status Changed to Started");
  });

  const message = {
    message: "Ride Started",
    rideDetails: {
      origin: exist.origin,
      destination: exist.destination,
      stops: exist.stops,
      IDs: {
        rideID: rideID,
        driverID: driverID,
      },
      distance: distance.distanceText,
    },
    driverDetails: {
      name: driver.firstName + " " + driver.lastName,
      email: driver.email,
      id: driver._id,
    },
    ridersDetails: {
      riders: exist.riders,
    },
  };

  return message;
};

//get waiting list
const getWaitingList = async function (req) {
  const rideId = req.query.rideId;

  //chek if ride exists
  const exist = await Rides.findOne({ _id: rideId });
  if (!exist) {
    Logger.info("The ride doesnt exist");
    return callback({ message: "Ride doesnt exist" });
  } else {
    Logger.info("Ride Exists...");
  }

  //get all the riders in the ride
  const riders = exist.riders;
  //find details for each user
  const ridersDetails = await Promise.all(
    riders.map(async (user) => {
      console.log(user);
      const userExist = await User.findOne({ _id: user });
      if (userExist) {
        return {
          name: userExist.firstName + " " + userExist.lastName,
          email: userExist.email,
          id: userExist._id,
        };
      } else {
        Logger.info("User doesnt exist");
      }
    })
  );

  const message = {
    riders: ridersDetails,
    status: "All Paid",
  };
  return message;
};
console.log("🚀 ~ getWaitingList ~ getWaitingList:", getWaitingList);

//delete user from waitinglist
const deleteWaitingList = async function (details, callback) {
  const { rideId, userId } = details;
  console.log(details);
  //check if ride exists
  const exist = await Rides.findOne({
    _id: rideId,
  })
    .where("departure_time")
    .gte(new Date());

  if (!exist) {
    Logger.info("The ride doesnt exist");
    return callback({ message: "Ride doesnt exist" });
  } else {
    Logger.info("Ride Exists...");
  }

  //check if user exists
  const user = await User.findOne({
    _id: userId,
  });
  if (!user) {
    Logger.info("The user doesnt exist");
    return callback({ message: "User doesnt exist" });
  } else {
    Logger.info("User Exists...");
  }

  //get the waiting list
  const awaiting = await Awaiting.findOne({
    rideId: rideId,
  });
  if (!awaiting) {
    Logger.info("The awaiting doesnt exist");
    return callback({ message: "Awaiting doesnt exist" });
  } else {
    Logger.info("Awaiting Exists...");
  }

  //check if user in that ride already
  const riders = exist.riders;
  const index = riders.indexOf(userId);
  if (index > -1) {
    Logger.info("User already in the ride");
    return callback({ message: "User already in the ride" });
  } else {
    Logger.info("User not in the ride");
  }

  //check if user in that waitng list
  const users = awaiting.users;
  const index2 = users.indexOf(userId);
  if (index2 < 0) {
    Logger.info("User not in the waiting list");
    return callback({ message: "User not in the waiting list" });
  }

  //delete user from the waiting list
  users.splice(index2, 1);
  await awaiting.save().then(() => {
    Logger.info("User removed from the waiting list");
  });

  const message = `User${userId} removed from the waiting list`;
  return message;
};

//make 4digit code
const codemaker = async function (details, callback) {
  console.log(details);
};

//verify security code
const verifySecurityCode = async function (details, callback) {
  const { rideId, userId, code } = details;
  Logger.info("🚀 ~ verifySecurityCode ~ details:", details);
  const searchCode = await CODE.findOne({ rideID: rideId });
  console.log("🚀 ~ verifySecurityCode ~ searchCode:", searchCode);
  if (!searchCode) {
    Logger.info("Code not found");
    return callback({ message: "Code not found" });
  } else {
    Logger.info("Code found");
  }
  const rideExist = await Rides.findOne({
    _id: rideId,
  });
  Logger.info("🚀 ~ verifySecurityCode ~ rideExist:", rideExist);
  if (!rideExist) {
    Logger.info("Ride not found");
    return callback({ message: "Ride doesnt exist" });
  } else {
    Logger.info("Ride found");
  }
  //check if code is thesame
  if (searchCode.code !== code) {
    Logger.info("Code doesnt match");
    return callback({ message: "Code doesnt match" });
  } else {
    Logger.info("Code matches");
  }

  // Find index of the user in the riders array
  const riders = rideExist.riders || []; // Ensure it's an array
  Logger.info("🚀 ~ verifySecurityCode ~ riders:", riders);

  const ridersStatus = rideExist.riderStatus;
  if (!riders || !Array.isArray(riders)) {
    Logger.info("Riders array is invalid or not found");
    return callback({ message: "Riders array not found" });
  }

  const riderIndex = riders.findIndex(
    (rider) => rider && rider.toString() === userId.toString()
  );

  if (riderIndex === -1) {
    Logger.info("User not found in ride");
    return callback({ message: "User not found in ride" });
  } else {
    Logger.info("User Found in ride");
  }

  // Update the status of the user in ridersStatus
  ridersStatus[riderIndex].status = "Verified";

  // Save the updated ride document
  await rideExist.save().then(() => {
    Logger.info("User status updated to Verified");
  });

  //verifyer
  console.log({
    ridersStatus: ridersStatus[riderIndex],
    ridersLength: riders.length,
  });

  return {
    message: "Code Verified",
    user: {
      id: userId,
      status: "Verified",
    },
  };
};

//end ride
const endRide = async function (details, callback) {
  const { rideID, driverID } = details;
  console.log("🚀 ~ endRide ~ { rideId, driverId }:", { rideID, driverID });

  //check if ride exists and have started
  const exist = await Rides.findOne({
    _id: rideID,
    ride_status: "Started",
  });
  console.log("🚀 ~ endRide ~ exist:", exist);
  if (!exist) {
    Logger.info("The ride doesnt exist");
    return callback({ message: "Ride doesnt exist" });
  } else {
    Logger.info("Ride Exists...");
  }

  //check if driver exists
  const driver = await User.findOne({
    _id: driverID,
  });
  if (!driver) {
    Logger.info("The driver doesnt exist");
    return callback({ message: "Driver doesnt exist" });
  } else {
    Logger.info("Driver Exists...");
  }

  //check if driver in that ride
  const ridesCreated = driver.ridesCreated;
  const index = ridesCreated.indexOf(rideID);
  if (index < 0) {
    Logger.info("Driver not in the ride");
    return callback({ message: "Driver not in the ride" });
  } else {
    Logger.info("Driver in the ride");
  }

  //get the distance between origin and destination
  const origin = exist.origin.location.coordinates;
  const destination = exist.destination.location.coordinates;
  let originCordinates = {
    lat: origin[0],
    lon: origin[1],
  };
  let destinationCordinates = {
    lat: destination[0],
    lon: destination[1],
  };
  const distance = geoDistance(originCordinates, destinationCordinates);
  Logger.info("Distance Found");

  //check if the ride is currentl at destination
  // const now = new Date();
  // const departureTime = exist.departure_time;
  // if (now.getTime() !== departureTime.getTime()) {
  //   Logger.info("Not yet departure_time");
  //   return callback({ message: "Ride not yet started" });
  // } else {
  //   Logger.info("Ride is to start");
  // }

  //check if current cordinates now match with destination cordinates(driver now at destination)
  // const driverCordinates = driver.location.coordinates;
  // if (
  //   driverCordinates.lat !== destinationCordinates.lat &&
  //   driverCordinates.lon !== destinationCordinates.lon
  // ) {
  //   Logger.info("Driver not at destination");
  //   return callback({ message: "Driver not at destination" });
  // } else {
  //   Logger.info("Driver at destination");
  // }

  //change the status of the ride
  exist.ride_status = "Ended";
  console.log("Changed");
  await exist.save().then(() => {
    Logger.info("Ride Status Changed to Ended");
  });

  //delete ride from drivers list
  ridesCreated.splice(index, 1);
  await driver.save().then(() => {
    Logger.info("Ride removed from driver");
  });

  //delete ride
  await deleteRide({ id: rideID })
    .then(() => {
      Logger.info("Ride Deleted");
    })
    .catch((error) => {
      Logger.info("Error Deleting Ride", error);
      throw new Error("Error Deleting Ride");
    });

  const message = {
    message: "Ride Ended",
    rideDetails: {
      origin: exist.origin,
      destination: exist.destination,
      stops: exist.stops,
      IDs: {
        rideID: rideID,
        driverID: driverID,
      },
      distance: distance,
    },
    driverDetails: {
      name: driver.firstName + " " + driver.lastName,
      email: driver.email,
      id: driver._id,
    },
    ridersDetails: {
      riders: exist.riders,
    },
  };

  return message;
};

//manage ride(passenger)
const userRide = async function (req, callback) {
  const userId = req.query.userId;
  const user = await User.findOne({ _id: userId });
  if (!user) {
    Logger.info("NO user found");
    return callback({ message: "No User Found" });
  } else {
    Logger.info("User Found");
  }
  const rides = user.rides;
  if (!rides || rides.length === 0) {
    Logger.info("No ride found");
    return {
      Message: "User not in a Ride",
    };
  } else {
    Logger.info("Ride Found");
  }
  const now = new Date();
  //fnd ride and populate creator field to ge creator details
  const userRides = await Rides.find({ _id: { $in: rides } });
  //check if the ride has currently expired
  const expiredRides = userRides.filter((ride) => ride.departure_time < now);
  if (expiredRides.length > 0) {
    Logger.info("Ride has expired");
    return Error({ message: "Ride has expired" });
  } else {
    Logger.info("Ride has not expired");
  }
  const ridesWithCreatorDetails = await Promise.all(
    userRides.map(async (ride) => {
      const creatorDetails = await User.findOne({ email: ride.creator });
      let creatorFullName = `${creatorDetails.firstName} ${creatorDetails.lastName}`;
      return {
        ...ride.toObject(), // Convert ride to a plain object

        creator: {
          creatorName: creatorFullName,
        }, // Replace the creator field with full user details
      };
    })
  );

  console.log(ridesWithCreatorDetails);

  if (!userRides) {
    Logger.info("No ride found");
    return callback({ message: "No ride found" });
  } else {
    Logger.info("Ride Found");
  }
  //construct date and time
  const formattedTime = format(
    ridesWithCreatorDetails[0].departure_time,
    "EEEE, MMMM do, yyyy 'at' hh:mm a"
  );

  const message = {
    status: "User in a ride and Ride, found",
    ride: {
      origin: ridesWithCreatorDetails[0].origin.name,
      destination: ridesWithCreatorDetails[0].destination.name,
      departureTime: formattedTime,
      creator: ridesWithCreatorDetails[0].creator,
      stops: ridesWithCreatorDetails[0].stops,
      price: ridesWithCreatorDetails[0].price,
      remainingCapacity: ridesWithCreatorDetails[0].remaining_capacity,
      LuggageType: ridesWithCreatorDetails[0].luggage_type,
    },
  };

  return message;
};
//test geocode getter
const testCode = async function (details, callback) {
  const { origin, destination } = details;
  const originCordinates = await getCordinates(origin);
  console.log("🚀 ~ testCode ~ originCordinates:", originCordinates);
  const destinationCordinates = await getCordinates(destination);
  console.log("🚀 ~ testCode ~ destinationCordinates:", destinationCordinates);
};

//test geodistance
const testDistance = async function (details, callback) {
  const { origin, destination } = details;

  //use geodistance function
  geoDistance(origin, destination).then((result) => {
    console.log("🚀 ~ testDistance ~ result:", result);
  });

  return "Done";
};

//delete all records
const deleteRecord = async function (details, callback) {
  deleteAllDocuments(Rides);
};
//check ride Expiration
const checkRideExpiration = async function () {
  const now = new Date();
  //return all the rides inthe system by price
  const rides = await Rides.find();
  console.log(rides);
  if (rides.length > 0) {
    Logger.info("Ride has expired");
    return rides;
  } else {
    Logger.info("Ride has not expired");
  }
};

//Get ride Status
const rideStatus = async function (req) {
  const rideId = req.query.rideId;

  //check if ride Exists
  const exist = await Rides.findOne({ _id: rideId });
  if (!exist) {
    Logger.info("Ride doesnt exist");
    throw new Error("Ride Doesnt Exist..");
  } else {
    Logger.info("Ride Exists");
  }

  //get the status of the ride
  const status = exist.ride_status;
  console.log(status);
  Logger.info(status);

  const message = {
    ride: exist._id,
    origin: exist.origin.name,
    destination: exist.destination.name,
    status: status,
  };
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
  requestToDriver,
  startRide,
  getWaitingList,
  deleteWaitingList,
  codemaker,
  verifySecurityCode,
  endRide,
  testCode,
  testDistance,
  userRide,
  checkRideExpiration,
  deleteRecord,
  rideStatus,
};
