// middlewares/validate.js
import Joi from "joi";

const validate = (schema) => {
  return (req, res, next) => {
    // Validate the request body against the provided schema
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      // If there are validation errors, return a 400 Bad Request with the details
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        details: error.details.map((err) => err.message),
      });
    }

    // If validation passes, move to the next middleware or controller
    next();
  };
};

export default validate;
