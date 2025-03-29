import mongoose from "mongoose";

const BookingsSchema = new mongoose.Schema({
  flight: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Flight",
    required: true,
  },
  scheduleIndex: { type: Number, required: true }, // Tracks which flight schedule is booked
  passengerName: { type: String, required: true },
  passengerEmail: { type: String, required: true },
  passportNumber: { type: String, required: true },
  dateOfBirth: { type: String, required: true },
  address: { type: String, required: true },
  country: { type: String },

  seatsBooked: { type: Number, required: true }, // Number of seats booked
  selectedSeats: [{ type: String }], // Specific seats chosen
  totalPrice: { type: Number, required: true }, // Price paid by the passenger
  status: {
    type: String,
    enum: ["Confirmed", "Pending", "Cancelled"],
    default: "Pending",
  },
  bookingDate: { type: Date, default: Date.now },

  isRoundTrip: { type: Boolean, default: false },
  returnFlight: { type: mongoose.Schema.Types.ObjectId, ref: "Flight" },
  returnDate: { type: Date },

  isJetShare: { type: Boolean, default: false }, // Determines if it's a Jet Share booking
  jetShareGroup: { type: mongoose.Schema.Types.ObjectId, ref: "Bookings" }, // Links Jet Share passengers
  flightOwner: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // The person who booked the full flight and enabled Jet Share
});

export default mongoose.model("Bookings", BookingsSchema);
