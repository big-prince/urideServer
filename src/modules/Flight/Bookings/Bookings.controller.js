import httpStatus from "http-status";
import bookingService from "./Bookings.service";

const bookJet = async (req, res) => {
  try {
    
    const flightId = req.params.flightId
    const scheduleIndex = req.body.scheduleIndex
    const passengerInfo = req.body.passengerInfo

    const airport = await bookingService.bookJet(flightId, scheduleIndex, passengerInfo);
    res.status(201).json(airport);
  } catch (error) {
    res.status(500).json({ message: "Error creating airport", error });
  }
};

const bookJetShareSeat = async (req, res) => {
  try {
    const airports = await airportService.getAllAirports();
    res.json(airports);
  } catch (error) {
    res.status(500).json({ message: "Error fetching airports", error });
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
  bookJetShareSeat,
  bookJetWithJetShare,
};
