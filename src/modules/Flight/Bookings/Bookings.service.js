import httpStatus from "http-status";
import Flight from "../Flights/Flights.model.js";
import ApiError from "../../../utils/ApiError.js";
import Bookings from "./Bookings.model.js";

const bookJet = async (flightId, scheduleIndex, passengerInfo, user) => {
  if (!flightId || scheduleIndex === undefined || !passengerInfo) {
    throw new ApiError(400, "Missing required booking details");
  }

  const flight = await Flight.findById(flightId);
  if (!flight) {
    throw new ApiError(404, "Flight not found");
  }

  const schedule = flight.availableSchedules[scheduleIndex];
  if (!schedule) {
    throw new ApiError(400, "Invalid schedule selected");
  }

  if (schedule.jetShare) {
    throw new ApiError(
      400,
      "This flight allows Jet Share. Please book a shared seat instead."
    );
  }

  if (schedule.availableSeats.length === 0) {
    throw new ApiError(400, "Flight is already fully booked");
  }

  const totalPrice = flight.fixedPrice;

  const booking = new Bookings({
    flight: flightId,
    scheduleIndex,
    passengerName: passengerInfo.name,
    passengerEmail: passengerInfo.email,
    passportNumber: passengerInfo.passportNumber,
    dateOfBirth: passengerInfo.dateOfBirth,
    address: passengerInfo.address,
    country: passengerInfo.country,
    seatsBooked: schedule.totalSeats,
    selectedSeats: schedule.availableSeats,
    totalPrice,
    status: "Pending",
    bookingDate: new Date(),
    isRoundTrip: false,
    isJetShare: false,
    flightOwner: user
  });

  await booking.save();

  // 🛠 Update Flight Status
  flight.availableSchedules[scheduleIndex].availableSeats = []; // No seats left
  flight.availableSchedules[scheduleIndex].sharedPassengers =
    schedule.totalSeats;
  flight.availableSchedules[scheduleIndex].jetShare = false;
  flight.status = "fully-booked";

  await flight.save();

  return {
    bookingId: booking._id,
    totalPrice,
  };
};

// Update the bookJetShareSeat function to use individual parameters
const bookJetShareSeat = async (
  flightId,
  scheduleIndex,
  passengerInfo,
  selectedSeat,
  user
) => {
  const flight = await Flight.findById(flightId);
  if (!flight) throw new ApiError(404, "Flight not found");

  const schedule = flight.availableSchedules[scheduleIndex];
  if (!schedule) throw new ApiError(400, "Invalid schedule selected");

  if (!schedule.jetShare)
    throw new ApiError(400, "Jet Share is not enabled for this flight");

  if (schedule.sharedPassengers >= schedule.maxPassengersPerJetShare) {
    throw new ApiError(400, "Jet Share is fully booked");
  }

  if (!schedule.availableSeats.includes(selectedSeat)) {
    throw new ApiError(400, "Selected seat is no longer available");
  }

  const pricePerSeat = schedule.jetSharePricePerSeat;
  if (!pricePerSeat) throw new ApiError(400, "Jet Share price not set");

  const ownerBooking = await Bookings.findOne({
    flight: flightId,
    scheduleIndex,
    isJetShare: false,
  });

  if (!ownerBooking)
    throw new ApiError(400, "Jet Share booking owner not found");

  const newBooking = new Bookings({
    flight: flightId,
    scheduleIndex,
    passengerName: passengerInfo.name,
    passengerEmail: passengerInfo.email,
    passportNumber: passengerInfo.passportNumber,
    dateOfBirth: passengerInfo.dateOfBirth,
    address: passengerInfo.address,
    country: passengerInfo.country,
    seatsBooked: 1,
    selectedSeats: [selectedSeat],
    totalPrice: pricePerSeat,
    status: "Pending",
    isJetShare: true,
    jetShareGroup: ownerBooking._id,
    flightOwner: ownerBooking.flightOwner,
  });

  await newBooking.save();

  schedule.availableSeats = schedule.availableSeats.filter(
    (seat) => seat !== selectedSeat
  );
  schedule.sharedPassengers += 1;

  if (schedule.sharedPassengers >= schedule.maxPassengersPerJetShare) {
    schedule.jetShare = false;
  }

  await flight.save();

  return {
    message: "Jet Share seat booked successfully",
    bookingId: newBooking._id,
    jetShareClosed: !schedule.jetShare,
  };
};

const getBookingById = async (bookingId) => {
  if (!bookingId) {
    throw new ApiError(400, "Booking ID is required");
  }

  const booking = await Bookings.findById(bookingId);
  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  return booking;
};

const bookJetWithJetShare = async ({
  flightId,
  scheduleIndex,
  passengerInfo,
  enableJetShare,
  maxJetSharePassengers,
  jetSharePricePerSeat,
  selectedSeat,
  user
}) => {
  if (!flightId || scheduleIndex === undefined || !passengerInfo || !selectedSeat) {
    throw new ApiError(400, "Missing required booking details, including selected seat");
  }

  const flight = await Flight.findById(flightId);
  if (!flight) throw new ApiError(404, "Flight not found");

  const schedule = flight.availableSchedules[scheduleIndex];
  if (!schedule) throw new ApiError(400, "Invalid schedule selected");

  if (schedule.jetShare) {
    throw new ApiError(400, "This flight already has an active Jet Share");
  }

  if (schedule.availableSeats.length === 0) {
    throw new ApiError(400, "Flight is already fully booked >>>>");
  }

  if (!schedule.availableSeats.includes(selectedSeat)) {
    throw new ApiError(400, "Selected seat is no longer available");
  }

  if (enableJetShare) {
    if (!maxJetSharePassengers || maxJetSharePassengers < 1) {
      throw new ApiError(400, "Invalid Jet Share passenger count");
    }

    if (maxJetSharePassengers >= schedule.totalSeats) {
      throw new ApiError(400, "Jet Share passengers cannot exceed the total seats");
    }

    if (!jetSharePricePerSeat || jetSharePricePerSeat <= 0) {
      throw new ApiError(400, "Jet Share price per seat must be a positive number");
    }
  }

  // Calculate total price (full flight price)
  const totalPrice = flight.fixedPrice;

  schedule.availableSeats = schedule.availableSeats.filter(seat => seat !== selectedSeat);

  // Create the booking for the main passenger
  const booking = new Bookings({
    flight: flightId,
    scheduleIndex,
    passengerName: passengerInfo.name,
    passengerEmail: passengerInfo.email,
    passportNumber: passengerInfo.passportNumber,
    dateOfBirth: passengerInfo.dateOfBirth,
    address: passengerInfo.address,
    country: passengerInfo.country,
    seatsBooked: 1,
    selectedSeats: [selectedSeat],
    totalPrice,
    status: "Pending",
    bookingDate: new Date(),
    isRoundTrip: false,
    isJetShare: false, // This is the main booking, not Jet Share
    flightOwner: user
  });

  await booking.save();

  schedule.sharedPassengers = 1;
  schedule.jetShare = enableJetShare;
  schedule.maxPassengersPerJetShare = enableJetShare ? maxJetSharePassengers : 0;
  schedule.jetSharePricePerSeat = enableJetShare ? jetSharePricePerSeat : 0;

  if (!enableJetShare) {
    flight.status = "fully-booked";
  }

  await flight.save();

  return {
    message: "Flight booked successfully",
    bookingId: booking._id,
    jetShareEnabled: enableJetShare,
    maxJetSharePassengers,
    jetSharePricePerSeat,
    bookedSeat: selectedSeat,
  };
};

export default {
  bookJet,
  bookJetShareSeat,
  bookJetWithJetShare,
  getBookingById
};
