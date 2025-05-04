import httpStatus from "http-status";
import bookingService from "./Bookings.service.js";

const bookJet = async (req, res, next) => {
  try {
    const user = req.realUser
    const { flightId } = req.params;
    console.log("flightId", flightId);
    const {
      scheduleIndex,
      selectedSeat,
      passengerInfo,
      enableJetShare,
      maxJetSharePassengers,
      jetSharePricePerSeat,
    } = req.body;

    let booking;

    if (enableJetShare) {
      console.log("JET SHARE ENABLED", enableJetShare);
      booking = await bookingService.bookJetWithJetShare({
        flightId,
        scheduleIndex,
        passengerInfo,
        enableJetShare,
        maxJetSharePassengers,
        jetSharePricePerSeat,
        selectedSeat,
        user
      });
    }
    // Fix here - don't pass an object, use individual parameters
    else if (!enableJetShare && selectedSeat) {
      console.log("JET SHARE DISABLED", enableJetShare);
      booking = await bookingService.bookJetShareSeat(
        flightId,
        scheduleIndex,
        passengerInfo,
        selectedSeat,
        user
      );
    }
    else if (
      !enableJetShare &&
      !maxJetSharePassengers &&
      !jetSharePricePerSeat &&
      !selectedSeat
    ) {
      console.log("JET SHARE DISABLED", enableJetShare);
      booking = await bookingService.bookJet(
        flightId,
        scheduleIndex,
        passengerInfo,
        user
      );
    }

    return res.status(201).json({
      message: "Booking successful, proceed to payment",
      booking,
    });
  } catch (error) {
    next(error);
  }
};

const getBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const booking = await bookingService.getBookingById(bookingId);
    return res.status(201).json({
      message: "Booking fetched successfully",
      booking,
    });
  } catch (error) {
    next(error);
  }
};

const bookJetWithJetShare = async (req, res) => {
  try {
    const airport = await airportService.getAirportById(req.params.id);
    if (!airport) return res.status(404).json({ message: "Airport not found" });
    res.json(airport);
  } catch (error) {
    res.status(500).json({ message: "Error fetching airport", error });
  }
};

export default {
  bookJet,
  getBooking,
  bookJetWithJetShare,
};
