import winston from "winston";
import path from "path";
import fs from "fs";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

const logDirectory = path.join(__dirname, "../logs");
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      
      const timestampString = timestamp as string;
      const bstTime = toZonedTime(new Date(timestampString), "Asia/Dhaka");
      const formattedTimestamp = format(bstTime, "yyyy-MM-dd HH:mm");

      return `${formattedTimestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: path.join(logDirectory, "execution.log"),
    }),
  ],
});

export default logger;
