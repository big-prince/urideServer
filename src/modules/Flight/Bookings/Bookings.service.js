import httpStatus from "http-status";
import Flight from "../Flights/Flights.model.js";
import ApiError from "../../../utils/ApiError.js";
import Bookings from "./Bookings.model.js";

const bookJet = async (flightId, scheduleIndex, passengerInfo) => {
  try {
    if (!flightId || scheduleIndex === undefined || !passengerInfo) {
      return res
        .status(400)
        .json({ error: "Missing required booking details" });
    }

    const flight = await Flight.findById(flightId);
    if (!flight) {
      return res.status(404).json({ error: "Flight not found" });
    }

    const schedule = flight.availableSchedules[scheduleIndex];
    if (!schedule) {
      return res.status(400).json({ error: "Invalid schedule selected" });
    }

    if (schedule.jetShare) {
      return res.status(400).json({
        error:
          "This flight allows Jet Share. Please book a shared seat instead.",
      });
    }
    if (schedule.availableSeats.length === 0) {
      return res.status(400).json({ error: "Flight is already fully booked" });
    }

    const totalPrice = flight.fixedPrice;

    const booking = new Booking({
      flight: flightId,
      scheduleIndex,
      passengerName: passengerInfo.name,
      passengerEmail: passengerInfo.email,
      passportNumber: passengerInfo.passportNumber,
      dateOfBirth: passengerInfo.dateOfBirth,
      address: passengerInfo.address,
      country: passengerInfo.country,
      seatsBooked: schedule.totalSeats, // Full flight booking = all seats booked
      selectedSeats: schedule.availableSeats, // Booking all available seats
      totalPrice,
      status: "Pending",
      bookingDate: new Date(),
      isRoundTrip: false,
      isJetShare: false,
    });

    await booking.save();

    // 6️⃣ Update Flight Status
    flight.availableSchedules[scheduleIndex].availableSeats = []; // No seats left
    flight.availableSchedules[scheduleIndex].sharedPassengers =
      schedule.totalSeats;
    flight.availableSchedules[scheduleIndex].jetShare = false;
    flight.status = "fully-booked";

    await flight.save();

    // 7️⃣ Proceed to Payment (This is just a placeholder)
    return res.status(200).json({
      message: "Booking successful, proceed to payment",
      bookingId: booking._id,
      totalPrice,
    });
  } catch (error) {
    console.error("Booking Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const bookJetShareSeat = async ({
  flightId,
  scheduleIndex,
  passengerDetails,
  selectedSeat,
}) => {
  try {
    // Fetch the flight details
    const flight = await Flight.findById(flightId);
    if (!flight) throw new Error("Flight not found");

    const schedule = flight.availableSchedules[scheduleIndex];
    if (!schedule) throw new Error("Invalid schedule");

    if (!schedule.jetShare)
      throw new Error("Jet Share is not enabled for this flight");

    // Check if Jet Share is already full
    if (schedule.sharedPassengers >= schedule.maxPassengersPerJetShare) {
      throw new Error("Jet Share is fully booked");
    }

    // Ensure seat is available
    if (!schedule.availableSeats.includes(selectedSeat)) {
      throw new Error("Selected seat is no longer available");
    }

    // Calculate price per seat
    const pricePerSeat = schedule.jetSharePricePerSeat;
    if (!pricePerSeat) throw new Error("Jet Share price not set");

    // Find the original booking owner (the person who enabled Jet Share)
    const ownerBooking = await Booking.findOne({
      flight: flightId,
      scheduleIndex,
      isJetShare: false, // The full flight booking
    });

    if (!ownerBooking) throw new Error("Jet Share booking owner not found");

    // Create a new booking for the Jet Share passenger
    const newBooking = new Booking({
      flight: flightId,
      scheduleIndex,
      ...passengerDetails,
      seatsBooked: 1,
      selectedSeats: [selectedSeat],
      totalPrice: pricePerSeat,
      status: "Pending",
      isJetShare: true,
      jetShareGroup: ownerBooking._id, // Link to the original booking
      flightOwner: ownerBooking.passengerEmail,
    });

    await newBooking.save();

    // Update available seats
    schedule.availableSeats = schedule.availableSeats.filter(
      (seat) => seat !== selectedSeat
    );
    schedule.sharedPassengers += 1;

    // **AUTO-CLOSE JET SHARE** when fully booked
    if (schedule.sharedPassengers >= schedule.maxPassengersPerJetShare) {
      schedule.jetShare = false; // Disable Jet Share mode
    }

    await flight.save();

    return {
      message: "Jet Share seat booked successfully",
      bookingId: newBooking._id,
      jetShareClosed: !schedule.jetShare, // Let the frontend know if Jet Share is now closed
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const bookJetWithJetShare = async ({
  flightId,
  scheduleIndex,
  passengerInfo,
  enableJetShare,
  maxJetSharePassengers,
  jetSharePricePerSeat,
}) => {
  try {
    if (!flightId || scheduleIndex === undefined || !passengerInfo) {
      throw new Error("Missing required booking details");
    }

    const flight = await Flight.findById(flightId);
    if (!flight) throw new Error("Flight not found");

    const schedule = flight.availableSchedules[scheduleIndex];
    if (!schedule) throw new Error("Invalid schedule selected");

    if (schedule.jetShare) {
      throw new Error("This flight already has an active Jet Share");
    }

    if (schedule.availableSeats.length === 0) {
      throw new Error("Flight is already fully booked");
    }

    // Ensure the Jet Share passenger count does not exceed the flight capacity
    if (enableJetShare) {
      if (!maxJetSharePassengers || maxJetSharePassengers < 1) {
        throw new Error("Invalid Jet Share passenger count");
      }

      if (maxJetSharePassengers >= schedule.totalSeats) {
        throw new Error("Jet Share passengers cannot exceed the total seats");
      }

      if (!jetSharePricePerSeat || jetSharePricePerSeat <= 0) {
        throw new Error("Jet Share price per seat must be a positive number");
      }
    }

    // Calculate total price (full flight price)
    const totalPrice = flight.fixedPrice;

    // Create the booking for the main passenger
    const booking = new Booking({
      flight: flightId,
      scheduleIndex,
      passengerName: passengerInfo.name,
      passengerEmail: passengerInfo.email,
      passportNumber: passengerInfo.passportNumber,
      dateOfBirth: passengerInfo.dateOfBirth,
      address: passengerInfo.address,
      country: passengerInfo.country,
      seatsBooked: schedule.totalSeats, // Full flight booking = all seats booked
      selectedSeats: schedule.availableSeats, // Booking all available seats
      totalPrice,
      status: "Pending",
      bookingDate: new Date(),
      isRoundTrip: false,
      isJetShare: false, // This is the main booking, not Jet Share
      flightOwner: passengerInfo.email, // The owner of the Jet Share flight
    });

    await booking.save();

    // Update Flight Schedule to reflect booking
    schedule.availableSeats = []; // No seats left
    schedule.sharedPassengers = schedule.totalSeats;
    schedule.jetShare = enableJetShare; // Enable Jet Share if requested
    schedule.maxPassengersPerJetShare = enableJetShare
      ? maxJetSharePassengers
      : 0;
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
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

export default {
  bookJet,
  bookJetShareSeat,
};
