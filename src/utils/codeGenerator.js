import CODE from "../modules/rides/securityCode.model.js";
import clearIndex from "./clearIndex.js";
import logger from "../config/logger.js";

//code generator function
const codeGenerator = async (userID, driverID, rideID, departure_time) => {
  const code = Math.floor(1000 + Math.random() * 9000);
  const newCode = new CODE({
    userID: userID,
    driverID: driverID,
    rideID: rideID,
    code: code,
    expiresAt: departure_time,
  });
  await newCode.save().then(() => {
    logger.info(`code generated for ${userID}, code${code}`);
  });
  return code;
};

export default codeGenerator;
