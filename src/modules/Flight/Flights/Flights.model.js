import mongoose from "mongoose";

const FlightSchema = new mongoose.Schema({
  airline: { type: mongoose.Schema.Types.ObjectId, ref: "Airline", required: true },
  flightNumber: { type: String, required: true, unique: true },
  departure: { type: mongoose.Schema.Types.ObjectId, ref: "Airport", required: true },
  destination: { type: mongoose.Schema.Types.ObjectId, ref: "Airport", required: true },
  pricePerKm: { type: Number, required: true },
  distanceKm: { type: Number, required: true },
  basePrice: { type: Number, required: true },
  status: { type: String, enum: ["open", "fully-booked"], default: "open" },
});

export default mongoose.model("Flight", FlightSchema);

/*  availableSchedules: [
    {
      date: { type: Date, required: true },
      departureTime: { type: String, required: true },
      arrivalTime: { type: String, required: true },
      totalSeats: { type: Number, required: true },
      availableSeats: { type: Number, required: true },
    }
  ]*/