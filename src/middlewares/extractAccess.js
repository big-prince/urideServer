//middleware to extract access token from the request
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

//extract access token from header
const extractAccess = async (req, res, next) => {
  const header = req.header("Authorization");

  if (!header) {
    return res.status(401).json({
      status: "error",
      message: "Unauthorized access, No Auth Header",
    });
  }

  //extract token from header
  const token = header.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({
      status: "error",
      message: "Unauthorized access, token missing",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!mongoose.Types.ObjectId.isValid(decoded.sub)) {
      return res.status(401).json({
        status: "error",
        message: "Invalid user ID in token",
      });
    }

    req.token = decoded;
    req.id = decoded.sub;
    console.log("Auth Cleared...");
    next();
  } catch (error) {
    console.log('JWT Error:', error.name, error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication expired, please login again'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token format'
      });
    } else if (error.name === 'NotBeforeError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token not yet active'
      });
    } else {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized access, token verification failed'
      });
    }
  }
};

export default extractAccess;
