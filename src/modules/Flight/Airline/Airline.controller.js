import airlineService from "./Airline.service.js";

const bulkCreateAirlines = async (req, res) => {
  try {
    const airline = await airlineService.bulkCreateAirlines();
    res.status(201).json(airline);
  } catch (error) {
    res.status(500).json({ message: "Error creating airline", error });
  }
};

const getAllAirlines = async (req, res) => {
  try {
    const airlines = await airlineService.getAllAirlines();
    res.json(airlines);
  } catch (error) {
    res.status(500).json({ message: "Error fetching airlines", error });
  }
};

const getAirlineById = async (req, res) => {
  try {
    const airline = await airlineService.getAirlineById(req.params.id);
    if (!airline) return res.status(404).json({ message: "Airline not found" });
    res.json(airline);
  } catch (error) {
    res.status(500).json({ message: "Error fetching airline", error });
  }
};

const updateAirline = async (req, res) => {
  try {
    const airline = await airlineService.updateAirline(req.params.id, req.body);
    if (!airline) return res.status(404).json({ message: "Airline not found" });
    res.json(airline);
  } catch (error) {
    res.status(500).json({ message: "Error updating airline", error });
  }
};

const deleteAirline = async (req, res) => {
  try {
    const result = await airlineService.deleteAirline(req.params.id);
    if (!result) return res.status(404).json({ message: "Airline not found" });
    res.json({ message: "Airline deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting airline", error });
  }
};

export default {
  bulkCreateAirlines,
  getAllAirlines,
  getAirlineById,
  updateAirline,
  deleteAirline,
};
