import Mongoose from "mongoose";
import toJSON from "../../plugins/toJSON.plugin.js";
import paginate from "../../plugins/paginate.plugin.js";

let ObjectId = Mongoose.Types.ObjectId;
const reviewSchema = new Mongoose.Schema({
	ride: { type: ObjectId, ref: "rideSchema", required: true },
	reviewer: { type: ObjectId, ref: "userSchema", required: true },
	reviewee: { type: ObjectId, ref: "userSchema", required: true },
	rating: { type: Number, required: true },
	comment: String,
});


// add plugin that converts mongoose to json
reviewSchema.plugin(toJSON);
reviewSchema.plugin(paginate);

/**
 * @typedef Reviews
 */
const Reviews = Mongoose.model("Reviews", reviewSchema);

export default Reviews;
