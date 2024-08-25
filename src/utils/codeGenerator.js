import CODE from "../modules/rides/securityCode.model.js";
import clearIndex from "./clearIndex.js";
import logger from "../config/logger.js";

//code generator function
const codeGenerator = async (driverID, rideID, departure_time) => {
  console.log(driverID, rideID, departure_time, "Function Details");
  const code = Math.floor(1000 + Math.random() * 9000);
  const newCode = new CODE({
    driverID: driverID,
    rideID: rideID,
    code: code,
    expiresAt: departure_time,
  });
  await newCode.save().then(() => {
    logger.info(`code generated for ${rideID}, code${code}`);
  });

  //search for code
  const searchCode = await CODE.findOne({ rideID: rideID }).then(() => {
    logger.info("CodeExists");
  });
  return searchCode;
};

export default codeGenerator;
