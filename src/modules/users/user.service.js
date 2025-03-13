import httpStatus from "http-status";
import User from "./user.model.js";
import ApiError from "../../utils/ApiError.js";
import { sendWelcomeEmail } from "../com/emails/email.service.js";
import logger from "../../config/logger.js";
import Wallet from "../wallet/wallet.model.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }
  const user = await User.create(userBody);
  //set the persons wallet to be 0
  const wallet = new Wallet({
    userId: user._id,
    balance: 0.0,
  });
  await wallet.save().then(() => {
    console.log("Wallet created");
  });

  if (user) {
    let emailResponse = sendWelcomeEmail(user.email, user.firstName);
    // if (emailResponse.info) {
    user.message = "Welcome email sent";
    return user;
    // }
  }
  // return user;
};

/**
 * Handle Google Sign-In
 * @param {string} idToken - Google ID Token from frontend
 * @returns {Promise<{user: object, token: string}>}
 */
const googleSignIn = async (idToken) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid Google token");

    const { email, given_name, family_name, sub } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        firstName: given_name,
        lastName: family_name,
        email,
        password: sub, // Use Google ID as a placeholder password
        isEmailVerified: true, // Since Google verifies email
      });

      await Wallet.create({ userId: user._id, balance: 0.0 });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return { user, token };
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Google authentication failed");
  }
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findById(id);
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

//delete user by email
const deleteUserByEmail = async (email) => {
  console.log(email);
  const user = await User.findOneAndDelete({ email: email }).then(() => {
    logger.info("User Deleted");
  });
};

const updateToDriverProfile = async (userId, driverDetails) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  user.role = "driver";
  Object.assign(user, driverDetails); // Update driver-specific details
  await user.save();
  return user;
};

export default {
  createUser,
  googleSignIn,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserByEmail,
  updateToDriverProfile,
};
