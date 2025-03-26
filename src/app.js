import express, { json, urlencoded } from "express";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import LogRocket from "logrocket";
import xss from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";
import compression from "compression";
import cors from "cors";
import Passport from "passport";
import httpStatus from "http-status";
import env from "./config/config.js";
import Morgan from "./config/morgan.js";
import morgan from "morgan";
import expressJSDocSwagger from "express-jsdoc-swagger";
import jwtStrategy from "./config/passport.js";
import authLimiter from "./middlewares/rateLimiter.js";
import routes from "./modules/index.js";
import Errors from "./middlewares/error.js";
import ApiError from "./utils/ApiError.js";
import { swaggerConfigOptions } from "./config/swagger.js";
import dotenv from "dotenv";
import logger from "./config/logger.js";
import * as RideCleaner from "./middlewares/rideCleaner.js";
import fs from "fs";

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_PREFIX = process.env.API_PREFIX || "api/v1";

// if (env !== "test") {
app.use(Morgan.successHandler);
app.use(Morgan.errorHandler);
// }

// Use morgan for HTTP request logging
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

app.use(express.static(__dirname + "/public"));

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(json());

// parse urlencoded request body
app.use(urlencoded({ extended: true }));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options("*", cors());

// jwt authentication
app.use(Passport.initialize());
Passport.use("jwt", jwtStrategy);

// limit repeated failed requests to auth endpoints
// if (env === "production") {
//   app.use("/v1/auth", authLimiter);
// }
if (env === "production") {
  app.use(`${API_PREFIX}/auth`, authLimiter);
}

app.get(`${API_PREFIX}/healthcheck`, (req, res) => {
  try {
    res.send({
      uptime: Math.round(process.uptime()),
      message: "OK",
      timestamp: Date.now(),
    });
  } catch (e) {
    res.status(503).end();
  }
});

// Ping endpoint
app.get(`${API_PREFIX}/ping`, (req, res) => {
  res.end("uRide Server is Up n Running");
});

//logRocket
LogRocket.init("qmttgo/uride");

// sendFile will go here
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// v1 API routes with global prefix
app.use(`${API_PREFIX}`, routes);

// POST route to handle phone number submission
app.post("/submitPhoneNumber", (req, res) => {
  const phoneNumber = req.body.phoneNumber;
  console.log("Received phone number:", phoneNumber);
  res.json({ message: "Phone number received successfully" });
});

// Example route that generates a log
app.get("/logme", (req, res) => {
  logger.info("Root path accessed");
  res.send("Hello, world!");
});

app.use((err, req, res, next) => {
  logger.error(
    `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${
      req.method
    } - ${req.ip}`
  );
  res.status(err.status || 500).send("Something broke!");
});

// v1 api routes
// routes(app);

//swagger config
expressJSDocSwagger(app)(swaggerConfigOptions);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

// convert error to ApiError, if needed
app.use(Errors.errorConverter);

// handle error
app.use(Errors.errorHandler);

export default app;
