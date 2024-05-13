import Mongoose from "mongoose";
import toJSON from "../../plugins/toJSON.plugin.js";
import paginate from "../../plugins/paginate.plugin.js";

let ObjectId = Mongoose.Types.ObjectId;

const pointSchema = new Mongoose.Schema({
    type: {
        type: String,
        enum: ['Point'],
        required: true
    },
    coordinates: {
        type: [Number],
        required: true
    }
});

const rideSchema = new Mongoose.Schema({
    origin: {
        name: {type: String, required: false},
        location: pointSchema,
        // index: "2dsphere"
    },
    destination: {
        name: {type: String, required: false},
        location: pointSchema,
        // index: "2dsphere"
    },
    departure_time: {type: Date, required: true},
    total_capacity: {type: Number, required: true},
    remaining_capacity: {type: Number, required: true},
    creator: {type: ObjectId, ref: "userSchema"},
    riders: [{type: ObjectId, ref: "userSchema"}],
    transport: String,
});

rideSchema.index({origin: "2dsphere", destination: "2dsphere"})

// add plugin that converts mongoose to json
rideSchema.plugin(toJSON);
rideSchema.plugin(paginate);

/**
 * @typedef Rides
 */
const Rides = Mongoose.model("Rides", rideSchema);

export default Rides;
