import { resolve } from "app-root-path";
import * as fs from "fs";
import { Logger } from "winston";
import { createLogger, format, transports } from "winston";

class LoggingService {
  private logFilePath: string;
  private date: Date;
  private logger: Logger;
  constructor() {
    if (!fs.existsSync(resolve("logs"))) {
      fs.mkdirSync(resolve("logs"));
    }

    this.date = new Date();
    this.logFilePath = resolve(`logs/logs-${this.date.toISOString()}`);
    this.logger = createWinstonLogger(this.logFilePath);
  }

  public info(log: string) {
    this.logger.info(log);
  }

  public error(err: Error) {
    this.logger.error(err);
  }
}
export const loggingService = new LoggingService();

function createWinstonLogger(filename: string) {
  return createLogger({
    level: "info",
    format: format.combine(
      format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
      }),
      format.errors({ stack: true }),
      format.splat(),
      format.json(),
    ),
    defaultMeta: { service: "your-service-name" },
    transports: [new transports.File({ filename })],
  });
}
