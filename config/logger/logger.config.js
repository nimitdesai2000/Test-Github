const winston = require("winston");
const DailyRotateFile= require("winston-daily-rotate-file");

const logLevels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
};

const transport = new DailyRotateFile({
  filename: "./logs/knowledgebase-%DATE%.log",
  datePattern: "YYYY-MM-DD HH:mm:ss",
  zippedArchive: true,
  maxSize: "20m", // Max size of the log file before rotation
  maxFiles: "6d", // Retain logs for 14 days
});

const logger = winston.createLogger({
  levels: logLevels,
  transports: [
    transport,
    new winston.transports.Console(),
    new winston.transports.File({
      filename: "./logs/knowledgebase.log",
    }),
  ],
  format: winston.format.combine(
    winston.format.label({
      label: `agami-knowledgebase`,
    }),
    winston.format.errors({stack: true}),
    winston.format.timestamp({
      format: "MMM-DD-YYYY HH:mm:ss",
    }),
    winston.format.printf(
      (info) =>
        `${info.level}: ${info.label}: ${[info.timestamp]}: ${info.message}`,
      (error) => 
        `${error.level}: ${error.label}: ${[error.timestamp]}: ${error.message} ${error.stack}`,
    )
  ),
});
module.exports = logger;