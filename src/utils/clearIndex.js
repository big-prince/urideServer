import Mongoose from "mongoose";
import logger from "../config/logger.js";

//fuction to clear any database index
const clearIndex = async (model) => {
  try {
    await model.collection.dropIndexes().then(() => {
      logger.info(`index cleared for ${model}`);
    });
  } catch (error) {
    if (error.code === 26) {
      logger.info("ClearIndex not found");
    } else {
      logger.info("CLearIndexError: ", error);
    }
  }
};

export default clearIndex;
