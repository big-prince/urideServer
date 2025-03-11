// middlewares/auth.js
import jwt from "jsonwebtoken"; // Import the JWT package
import httpStatus from "http-status"; // HTTP status codes
import ApiError from "../utils/ApiError.js"; // Custom error handler
import Token from "../modules/auth/token.model.js";
import verifyToken from "../modules/auth/token.service.js"; // Import the token verification service

// Secret for JWT (in a real application, store this in an environment variable)
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

/**
 * Middleware to check if the user is authenticated by verifying the JWT token.
 */
const auth = async (req, res, next) => {
  // Get the token from the Authorization header
  const token = req.headers.authorization?.split(" ")[1]; // Bearer token

  if (!token) {
    // If no token is provided, return an error
    return next(
      new ApiError(httpStatus.UNAUTHORIZED, "Authentication token is required")
    );
  }

  try {
    // Verify the token using the secret key
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach the decoded user data to the request object (you can use req.user in the next middlewares/controllers)
    req.user = decoded;
    console.log("decoded", decoded);
    // Proceed to the next middleware or controller
    next();
  } catch (err) {
    console.log(err);
    // If token verification fails, return an error
    return next(
      new ApiError(httpStatus.UNAUTHORIZED, "Invalid authentication token")
    );
  }
};

export default auth;
