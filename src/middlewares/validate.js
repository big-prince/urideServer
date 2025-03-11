// middlewares/validate.js
import Joi from "joi"; // Correct import
import httpStatus from "http-status"; // Import HTTP status properly
import pick from "../utils/pick.js";
import ApiError from "../utils/ApiError.js";

const validate = (schema) => (req, res, next) => {
  // Pick valid keys from schema (params, query, body)
  const validSchema = pick(schema, ["params", "query", "body"]);
  // Pick relevant parts from the request
  const object = pick(req, Object.keys(validSchema));

  // Validate using Joi.validate instead of Joi.compile
  const { error, value } = Joi.object(validSchema).validate(object, {
    abortEarly: false, // Validate all fields before returning
    allowUnknown: true, // Allow unknown fields (ignore extras)
    stripUnknown: true, // Remove unknown fields
  });

  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(", ");
    return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
  }

  Object.assign(req, value); // Assign valid values back to req object
  return next(); // Pass control to the next middleware
};

export default validate;
