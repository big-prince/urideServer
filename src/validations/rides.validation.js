import joi from "joi";
import validator from "./custom.validation.js";
import { query } from "express";

// const createRide = {
//   body: joi.object().keys({
//     origin: joi.string().trim().required(),
//     destination: joi.string().trim().required(),
//     stops: joi.array().items(joi.string().trim()).optional(),
//     type: joi.string().valid("One-time", "Recurring").required(),
//     other: joi.string().trim().optional().allow("None"),
//     price: joi.number().min(0).required(),
//     brs: joi.number().integer().min(1).required(),
//     departure_time: joi.date().iso().required(),
//     total_capacity: joi.number().integer().min(1).required(),
//     remaining_capacity: joi.number().integer().min(0).required(),
//     creator: joi.string().email().required(),
//     riders: joi.array().items(joi.string().trim().email()).optional(),
//     luggage_type: joi.string().valid("small", "medium", "large").required(),
//     carName: joi.string().trim().required(),
//     carColor: joi.string().trim().required(),
//     carNumber: joi
//       .string()
//       .pattern(new RegExp("^[A-Z]{3} \\d{4}[A-Z]{2}$"))
//       .required(),
//   }),
// };

const searchRides = {
  body: joi.object().keys({
    origin: joi.string().trim().required(),
    destination: joi.string().trim().required(),
  }),
};

const driverRides = {
  body: joi.object().keys({
    email: joi.string().email().required(),
  }),
};

const addRider = {
  body: joi.object().keys({
    price: joi.number().min(0).required(),
    rideId: joi.string().required(),
    riderId: joi.string().required(),
  }),
};

const removeRider = {
  body: joi.object().keys({
    rideId: joi.string().required(),
    riderId: joi.string().required(),
  }),
};

const deleteRide = {
  body: joi.object().keys({
    rideId: joi.string().required(),
  }),
};

const requestToDriver = {
  body: joi.object().keys({
    price: joi.number().min(0).required(),
    rideId: joi.string().required(),
    riderId: joi.string().required(),
  }),
};

const startRide = {
  body: joi.object().keys({
    driverID: joi.string().required(),
    rideID: joi.string().required(),
  }),
};

const getWaitingList = {
  query: joi.object().keys({
    rideId: joi.string().required(),
  }),
};

const deleteWaitingList = {
  query: joi.object().keys({
    rideId: joi.string().required(),
    userId: joi.string().required(),
  }),
};

const verifySecurityCode = {
  body: joi.object().keys({
    rideId: joi.string().required(),
    userId: joi.string().required(),
    code: joi.number().required(),
  }),
};

const endRide = {
  body: joi.object().keys({
    rideID: joi.string().required(),
    driverID: joi.string().required(),
  }),
};

const userRide = {
  query: joi.object().keys({
    userId: joi.string().required(),
  }),
};

const rideStatus = {
  query: joi.object().keys({
    rideId: joi.string().required(),
  }),
};

export default {
  // createRide,
  searchRides,
  driverRides,
  addRider,
  removeRider,
  deleteRide,
  requestToDriver,
  startRide,
  getWaitingList,
  deleteWaitingList,
  verifySecurityCode,
  endRide,
  userRide,
  rideStatus,
};
