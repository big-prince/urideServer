// import winston,{ format as _format, createLogger, transports as _transports } from 'winston';
import * as winston from "winston";
import "winston-daily-rotate-file";
import env from "./config.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the log directory
const logDirectory = path.join(__dirname, "..", "logs");

// Create a Daily Rotate File Transport
const transport = new winston.transports.DailyRotateFile({
  dirname: logDirectory,
  filename: "%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "2d", // Adjust the file retention period as needed
});

// Create the Winston Logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.printf(
      (info) => `${info.timestamp} ${info.level.toUpperCase()}: ${info.message}`
    )
  ),
  transports: [new winston.transports.Console(), transport],
});

// const enumerateErrorFormat = _format((info) => {
//   if (info instanceof Error) {
//     Object.assign(info, { message: info.stack });
//   }
//   return info;
// });

// const logger = createLogger({
//   level: env === 'development' ? 'debug' : 'info',
//   format: _format.combine(
//     enumerateErrorFormat(),
//     env === 'development' ? _format.colorize() : _format.uncolorize(),
//     _format.splat(),
//     _format.printf(({ level, message }) => `${level}: ${message}`)
//   ),
//   transports: [
//     new _transports.Console({
//       stderrLevels: ['error'],
//     }),
//   ],
// });

export default logger;
