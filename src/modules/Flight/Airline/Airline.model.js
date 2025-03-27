import mongoose from "mongoose";

const AirlineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  country: { type: String, required: true },
  fleetSize: { type: Number, required: true },
  logo: { type: String },
  image: { type: String },
  pilots: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pilot" }],
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
});

export default mongoose.model("Airline", AirlineSchema);
