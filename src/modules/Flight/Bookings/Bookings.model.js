import mongoose from "mongoose";

const BookingsSchema = new mongoose.Schema({
  flight: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Flight",
    required: true,
  },
  scheduleIndex: { type: Number, required: true }, 
  passengerName: { type: String, required: true },
  passengerEmail: { type: String, required: true },
  passportNumber: { type: String, required: true },
  dateOfBirth: { type: String, required: true },
  address: { type: String, required: true },
  country: { type: String },

  seatsBooked: { type: Number, required: true }, 
  selectedSeats: [{ type: String }], 
  totalPrice: { type: Number, required: true }, 
  status: {
    type: String,
    enum: ["Confirmed", "Pending", "Cancelled"],
    default: "Pending",
  },
  paymentStatus: {
    type: String,
    enum: ["successful", "unsuccessful", "pending"],
    default: "pending",
  },
  bookingDate: { type: Date, default: Date.now },

  isRoundTrip: { type: Boolean, default: false },
  returnFlight: { type: mongoose.Schema.Types.ObjectId, ref: "Flight" },
  returnDate: { type: Date },

  isJetShare: { type: Boolean, default: false }, 
  jetShareGroup: { type: mongoose.Schema.Types.ObjectId, ref: "Bookings" },
  flightOwner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

export default mongoose.model("Bookings", BookingsSchema);
