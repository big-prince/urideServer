const mongoose = require("mongoose");

const BookingsSchema = new mongoose.Schema({
  flight: { type: mongoose.Schema.Types.ObjectId, ref: "Flight", required: true },
  passengerName: { type: String, required: true },
  passengerEmail: { type: String, required: true },
  seatsBooked: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ["Confirmed", "Pending", "Cancelled"], default: "Pending" },
  bookingDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Bookings", BookingsSchema);
