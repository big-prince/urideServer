import mongoose from "mongoose";

const FlightSchema = new mongoose.Schema({
  airline: { type: mongoose.Schema.Types.ObjectId, ref: "Airline", required: true },
  flightNumber: { type: String, required: true, unique: true },
  departure: { type: mongoose.Schema.Types.ObjectId, ref: "Airport", required: true },
  destination: { type: mongoose.Schema.Types.ObjectId, ref: "Airport", required: true },
  fixedPrice: { type: Number, required: true }, // Full flight price (if booked fully)
  status: { type: String, enum: ["open", "fully-booked"], default: "open" },

  availableSchedules: [
    {
      departureTime: { type: String, required: true }, 
      arrivalTime: { type: String, required: true },    
      totalSeats: { type: Number, required: true }, 
      availableSeats: [{ type: String }], // List of available seat numbers
      additionalCharge: { type: Number, default: 0 },

      jetShare: { type: Boolean, default: false }, // Indicates if Jet Share is enabled
      jetSharePricePerSeat: { type: Number }, // Price per passenger in Jet Share mode
      maxPassengersPerJetShare: { type: Number }, // Max allowed passengers in Jet Share
      sharedPassengers: { type: Number, default: 0 }, // Tracks how many passengers have joined
    }
  ]
});

export default mongoose.model("Flight", FlightSchema);
