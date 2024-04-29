import Mongoose from "mongoose";
import toJSON from "../../plugins/toJSON.plugin.js";
import paginate from "../../plugins/paginate.plugin.js";

const reviewSchema = new Schema({
	ride: { type: ObjectId, ref: "rideSchema", required: true },
	reviewer: { type: ObjectId, ref: "userSchema", required: true },
	reviewee: { type: ObjectId, ref: "userSchema", required: true },
	rating: { type: Number, required: true },
	comment: String,
});


// add plugin that converts mongoose to json
rideSchema.plugin(toJSON);
rideSchema.plugin(paginate);

/**
 * @typedef Rides
 */
const Reviews = Mongoose.model("Reviews", rideSchema);

export default Reviews;
