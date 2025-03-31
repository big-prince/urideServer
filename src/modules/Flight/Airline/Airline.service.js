import httpStatus from "http-status";
import Airline from "./Airline.model.js";
import ApiError from "../../../utils/ApiError.js";
import Airport from "../Airport/Airport.model.js";
import Pilot from "./Pilot.model.js";
import Review from "./Reviews.model.js";
import User from "../../users/user.model.js";

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
      "https://radpointer.com/wp-content/uploads/2024/02/Air-Peace.jpeg",
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

const pilotNames = [
  "James Anderson",
  "Emily Johnson",
  "Michael Smith",
  "Sophia Davis",
  "David Wilson",
  "Olivia Martinez",
  "Daniel Brown",
  "Emma Thomas",
];

const reviewTexts = [
  "Fantastic airline, great service!",
  "Smooth flight and friendly crew.",
  "Decent experience, but room for improvement.",
  "Very comfortable seats and professional pilots.",
  "Flight was delayed, but overall good service.",
];

const getRandomAirlines = () => {
  const shuffled = airlineData.sort(() => 0.5 - Math.random()); 
  return shuffled.slice(0, 4); 
};
const getRandomNumber = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const bulkCreateAirlines = async () => {
  try {
    const airports = await Airport.find();

    if (!airports.length) {
      throw new Error("No airports found");
    }

    await Airline.deleteMany(); // Clear existing airlines

    const airlinesData = [];

    airports.forEach((airport) => {
      const selectedAirlines = getRandomAirlines(); // Pick 4 random airlines

      selectedAirlines.forEach((airline) => {
        if (!airline.name || !airline.country) {
          console.error("❌ Missing name or country in airline:", airline);
          return; // Skip invalid airline
        }

        airlinesData.push({
          name: airline.name, // Explicitly set name
          code: `${airline.code}-${airport.code}`, // Unique code
          country: airline.country, // Ensure country exists
          fleetSize: airline.fleetSize || getRandomNumber(2, 10),
          logo: airline.logo || "", // Provide default values if needed
          image: airline.image || "",
          airport: airport._id, 
        });
      });
    });

    if (airlinesData.length === 0) {
      throw new Error("No valid airlines to insert");
    }

    const createdAirlines = await Airline.insertMany(airlinesData);

    for (const airline of createdAirlines) {
      await Airport.findByIdAndUpdate(airline.airport, {
        $push: { airlines: airline._id },
      });
    }

    console.log("✅ Airlines created successfully:");
    return createdAirlines;
  } catch (error) {
    console.error("❌ Error creating airlines:", error);
    throw error;
  }
};

const bulkCreatePilotAndReviews = async () => {
  try {
    const airlines = await Airline.find();
    if (!airlines.length) throw new Error("No airlines found!");

    await Pilot.deleteMany(); // Clearing previous pilots
    await Review.deleteMany(); // Clearing previous reviews

    let pilotsData = [];
    let reviewsData = [];
    let pilotsMap = {};
    let reviewsMap = {};

    const existingPilots = await Pilot.find({}, { licenseNumber: 1, _id: 0 });
    const usedLicenseNumbers = new Set(existingPilots.map((p) => p.licenseNumber));

    for (const airline of airlines) {
      pilotsMap[airline._id] = [];
      reviewsMap[airline._id] = [];

      // Generate pilots
      for (let i = 0; i < getRandomNumber(2, 5); i++) {
        let licenseNumber;
        do {
          licenseNumber = `PILOT-${getRandomNumber(1000, 9999)}`;
        } while (usedLicenseNumbers.has(licenseNumber));

        usedLicenseNumbers.add(licenseNumber);

        const pilot = {
          name: getRandomElement(pilotNames),
          image: `https://randomuser.me/api/portraits/men/${getRandomNumber(1, 99)}.jpg`,
          licenseNumber,
          hoursFlown: getRandomNumber(500, 10000),
          rating: getRandomNumber(3, 5),
          airline: airline._id,
        };
        pilotsData.push(pilot);
      }

      // Generate reviews
      const users = await User.find();
      const existingReviews = await Review.find({}, { user: 1, airline: 1, _id: 0 });
      const existingReviewSet = new Set(existingReviews.map(r => `${r.user}_${r.airline}`));

      for (let i = 0; i < getRandomNumber(1, 3); i++) {
        if (!users.length) break;

        const user = getRandomElement(users);
        const reviewKey = `${user._id}_${airline._id}`;

        if (existingReviewSet.has(reviewKey)) continue; // Skip duplicate reviews

        existingReviewSet.add(reviewKey);

        const review = {
          user: user._id,
          airline: airline._id,
          rating: getRandomNumber(3, 5),
          review: getRandomElement(reviewTexts),
        };
        reviewsData.push(review);
      }
    }

    // Insert pilots in bulk
    const createdPilots = await Pilot.insertMany(pilotsData);
    createdPilots.forEach(pilot => pilotsMap[pilot.airline].push(pilot._id));

    // Insert reviews in bulk and handle duplicates
    try {
      const createdReviews = await Review.insertMany(reviewsData, { ordered: false });
      createdReviews.forEach(review => reviewsMap[review.airline].push(review._id));
    } catch (err) {
      console.warn("Some reviews were skipped due to duplicate keys.");
    }

    // Update airlines with pilots and reviews
    for (const airlineId of Object.keys(pilotsMap)) {
      await Airline.findByIdAndUpdate(airlineId, {
        $push: { pilots: { $each: pilotsMap[airlineId] } },
      });
    }

    for (const airlineId of Object.keys(reviewsMap)) {
      await Airline.findByIdAndUpdate(airlineId, {
        $push: { reviews: { $each: reviewsMap[airlineId] } },
      });
    }

    console.log("✅ Pilots and Reviews added successfully!");
    return { createdPilots, createdReviews };
  } catch (error) {
    console.error("❌ Error seeding pilots and reviews:", error);
    throw error;
  }
};

/**
 * Get all airlines
 * @returns {Promise<Array<Airline>>}
 */
const getAllAirlines = async () => {
  return await Airline.find()
    .populate("pilots")  // Populate pilots relationship
    .populate("reviews") // Populate reviews relationship
    .sort({ name: 1 });  // Sort alphabetically
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
  bulkCreatePilotAndReviews,
  getAirlineById,
  updateAirline,
  deleteAirline,
};
