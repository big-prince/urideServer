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
    console.log(error);
    return res.status(401).json({
      status: "error",
      message: "Unauthorized access, invalid token",
    });
  }
};

export default extractAccess;
