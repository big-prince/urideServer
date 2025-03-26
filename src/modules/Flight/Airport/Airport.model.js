import mongoose from "mongoose";

const AirportSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true }, 
  city: { type: String, required: true },
  country: { type: String, required: true },
  type: { type: String, enum: ["International", "Domestic"], required: true },

  airlines: [{ type: mongoose.Schema.Types.ObjectId, ref: "Airline" }]
});

export default mongoose.model("Airport", AirportSchema);
    