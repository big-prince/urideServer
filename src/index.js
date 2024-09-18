import Mongoose from "mongoose";
import app from "./app.js";
import { Server } from "socket.io";
import setupWebSocket from "./modules/websocket/socket.js";
import Config from "./config/config.js";
import Logger from "./config/logger.js";

let server;
Mongoose.connect(Config.mongoose.url, Config.mongoose.options).then(() => {
  Logger.info("Connected to MongoDB");
  server = app.listen(Config.port, () => {
    Logger.info(`uRide Server running on port: ${Config.port}
      -----------------------------------------
      Running on uRide Server
      -----------------------------------------
    `);
    Logger.info(`SMPT PORT ${Config.email.smtp.host}`);
  });
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });
  setupWebSocket(io);
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
