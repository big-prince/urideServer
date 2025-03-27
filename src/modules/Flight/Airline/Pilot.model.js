import mongoose from "mongoose";

const PilotSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    licenseNumber: { type: String, required: true, unique: true },
    hoursFlown: { type: Number, required: true, min: 0 },
    rating: { type: Number, required: true, min: 1, max: 5 },
    airline: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Airline",
      required: true,
    },
  },
  { timestamps: true }
);

const Pilot = mongoose.model("Pilot", PilotSchema);
export default Pilot;
