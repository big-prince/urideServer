import Mongoose from "mongoose";
import toJSON from "../../plugins/toJSON.plugin.js";
import paginate from "../../plugins/paginate.plugin.js";

const rideSchema = new Mongoose.Schema({
	origin: { type: String, required: true },
	destination: { type: String, required: true },
	departure_time: { type: Date, required: true },
	total_capacity: { type: Number, required: true },
	remaining_capacity: { type: Number, required: true },
	creator: { type: ObjectId, ref: "userSchema" },
	riders: [{ type: ObjectId, ref: "userSchema" }],
	transport: String,
});

// add plugin that converts mongoose to json
rideSchema.plugin(toJSON);
rideSchema.plugin(paginate);

/**
 * @typedef Rides
 */
const Rides = Mongoose.model("Rides", rideSchema);

export default Rides;
