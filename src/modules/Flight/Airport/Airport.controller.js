import airportService from "./Airport.service.js";

const bulkCreateAirport = async (req, res) => {
  try {
    const airport = await airportService.bulkCreateAirport();
    res.status(201).json(airport);
  } catch (error) {
    res.status(500).json({ message: "Error creating airport", error });
  }
};

const getAllAirports = async (req, res) => {
  try {
    const airports = await airportService.getAllAirports();
    res.json(airports);
  } catch (error) {
    res.status(500).json({ message: "Error fetching airports", error });
  }
};

const getAirportById = async (req, res) => {
  try {
    const airport = await airportService.getAirportById(req.params.id);
    if (!airport) return res.status(404).json({ message: "Airport not found" });
    res.json(airport);
  } catch (error) {
    res.status(500).json({ message: "Error fetching airport", error });
  }
};

const updateAirport = async (req, res) => {
  try {
    const airport = await airportService.updateAirport(req.params.id, req.body);
    if (!airport) return res.status(404).json({ message: "Airport not found" });
    res.json(airport);
  } catch (error) {
    res.status(500).json({ message: "Error updating airport", error });
  }
};

const deleteAirport = async (req, res) => {
  try {
    const result = await airportService.deleteAirport(req.params.id);
    if (!result) return res.status(404).json({ message: "Airport not found" });
    res.json({ message: "Airport deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting airport", error });
  }
};

export default {
  bulkCreateAirport,
  getAllAirports,
  getAirportById,
  updateAirport,
  deleteAirport,
};
