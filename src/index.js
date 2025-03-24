import Mongoose from "mongoose";
import app from "./app.js";
import { Server } from "socket.io";
import { createServer } from "node:http";
import Config from "./config/config.js";
import Logger from "./config/logger.js";
import setupWebSocket from "./modules/websocket/chat.socket.js";

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let configUrl;
if (process.env.NODE_ENV === "production") {
  configUrl = process.env.MONGODB_URI;
} else {
  configUrl = process.env.DEV_DATABASE_URL;
}

Mongoose.connect(configUrl, Config.mongoose.options)
  .then(() => {
    Logger.info("Connected to MongoDB");

    server.listen(Config.port, () => {
      Logger.info(`
      -----------------------------------------
      uRide Server running on port: ${Config.port}
      -----------------------------------------
      `);
      Logger.info(`SMTP PORT: ${Config.email.smtp.host}`);
    });

    setupWebSocket(io);
  })
  .catch((err) => {
    Logger.error("MongoDB connection failed:", err);
    process.exit(1);
  });

const exitHandler = () => {
  if (server) {
    server.close(() => {
      Logger.info("SIMS Server closed, Bye Bye my friends!");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  Logger.error(error);
  exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

process.on("SIGTERM", () => {
  Logger.info("SIGTERM received");
  if (server) {
    server.close();
  }
});

export { app, server };
