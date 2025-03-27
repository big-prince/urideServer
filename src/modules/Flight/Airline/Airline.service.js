import httpStatus from "http-status";
import Airline from "./Airline.model.js";
import ApiError from "../../../utils/ApiError.js";
import Airport from "../Airport/Airport.model.js";

/**
 * Create a new airline
 * @param {Object} airlineData
 * @returns {Promise<Airline>}
 */

const airlineNames = [
  "Air Peace",
  "Arik Air",
  "Dana Air",
  "Ibom Air",
  "Green Africa Airways",
  "United Nigeria Airlines",
  "Max Air",
  "Overland Airways",
];

const airlineData = [
  {
    name: "Air Peace",
    code: "AP-NG",
    country: "Nigeria",
    fleetSize: 32,
    logo: "https://upload.wikimedia.org/wikipedia/en/6/68/Air_Peace_logo.png",
    image:
      "https://airpeace.com/wp-content/uploads/2022/08/airpeace-flight.jpg",
  },
  {
    name: "Arik Air",
    code: "AA-NG",
    country: "Nigeria",
    fleetSize: 22,
    logo: "https://upload.wikimedia.org/wikipedia/en/d/df/Arik_Air_logo.svg",
    image: "https://www.arikair.com/images/arik_aircraft.jpg",
  },
  {
    name: "Dana Air",
    code: "DA-NG",
    country: "Nigeria",
    fleetSize: 10,
    logo: "https://www.danaair.com/img/logo.png",
    image: "https://www.danaair.com/img/fleet.png",
  },
  {
    name: "Ibom Air",
    code: "IA-NG",
    country: "Nigeria",
    fleetSize: 7,
    logo: "https://ibomair.com/wp-content/uploads/2021/05/IbomAir.png",
    image: "https://ibomair.com/wp-content/uploads/2021/05/aircraft.jpg",
  },
  {
    name: "Green Africa Airways",
    code: "GAA-NG",
    country: "Nigeria",
    fleetSize: 5,
    logo: "https://greenafrica.com/static/media/logo.23f4858d.svg",
    image: "https://greenafrica.com/static/media/airplane.8cfa7ffb.jpg",
  },
  {
    name: "United Nigeria Airlines",
    code: "UNA-NG",
    country: "Nigeria",
    fleetSize: 6,
    logo: "https://flyunitednigeria.com/assets/img/logo.png",
    image: "https://flyunitednigeria.com/assets/img/plane.jpg",
  },
  {
    name: "Max Air",
    code: "MA-NG",
    country: "Nigeria",
    fleetSize: 9,
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/b6/Max_Air_logo.png",
    image: "https://maxair.com.ng/assets/img/aircraft.jpg",
  },
  {
    name: "Overland Airways",
    code: "OA-NG",
    country: "Nigeria",
    fleetSize: 4,
    logo: "https://upload.wikimedia.org/wikipedia/en/7/7f/Overland_Airways_Logo.png",
    image:
      "https://overlandairways.com/wp-content/uploads/2021/04/aircraft.jpg",
  },
];

const getRandomAirlines = () => {
  const shuffled = airlineNames.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 4);
};
const getRandomNumber = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const bulkCreateAirlines = async () => {
  try {
    const airports = await Airport.find();

    if (!airports.length) {
      throw new Error("No airports found");
    }

    // Clear existing airlines to prevent duplicates
    await Airline.deleteMany();

    const airlinesData = [];

    airports.forEach((airport) => {
      const selectedAirlines = getRandomAirlines(); // Pick 4 random airlines

      selectedAirlines.forEach((airline) => {
        airlinesData.push({
          ...airline, // Use pre-seeded airline data
          code: `${airline.code}-${airport.code}`, // Ensure unique per airport
          airport: airport._id, // Link airline to airport
          fleetSize: airline.fleetSize || getRandomNumber(2, 10), // Use existing fleetSize or generate
        });
      });
    });

    // Insert all airlines into DB
    const createdAirlines = await Airline.insertMany(airlinesData);

    // Update each airport with its corresponding airlines
    for (const airline of createdAirlines) {
      await Airport.findByIdAndUpdate(airline.airport, {
        $push: { airlines: airline._id },
      });
    }

    console.log("✅ Airlines created successfully:", createdAirlines);
    return createdAirlines;
  } catch (error) {
    console.error("❌ Error creating airlines:", error);
    throw error;
  }
};

/**
 * Get all airlines
 * @returns {Promise<Array<Airline>>}
 */
const getAllAirlines = async () => {
  return await Airline.find().sort({ name: 1 }); // Sort alphabetically
};

/**
 * Get an airline by ID
 * @param {String} airlineId
 * @returns {Promise<Airline>}
 */
const getAirlineById = async (airlineId) => {
  const airline = await Airline.findById(airlineId);
  if (!airline) {
    throw new ApiError(httpStatus.NOT_FOUND, "Airline not found");
  }
  return airline;
};

/**
 * Update an airline by ID
 * @param {String} airlineId
 * @param {Object} updateData
 * @returns {Promise<Airline>}
 */
const updateAirline = async (airlineId, updateData) => {
  const airline = await Airline.findByIdAndUpdate(airlineId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!airline) {
    throw new ApiError(httpStatus.NOT_FOUND, "Airline not found");
  }

  return airline;
};

/**
 * Delete an airline by ID
 * @param {String} airlineId
 * @returns {Promise<void>}
 */
const deleteAirline = async (airlineId) => {
  const airline = await Airline.findByIdAndDelete(airlineId);
  if (!airline) {
    throw new ApiError(httpStatus.NOT_FOUND, "Airline not found");
  }
};

export default {
  bulkCreateAirlines,
  getAllAirlines,
  getAirlineById,
  updateAirline,
  deleteAirline,
};
