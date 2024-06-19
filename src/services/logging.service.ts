import { resolve } from "app-root-path";
import * as fs from "fs";
import { Logger } from "winston";
import { createApplicationLogger } from "../logging/logger";

class LoggingService {
  private logFilePath: string;
  private date: Date;
  private logger: Logger;
  constructor() {
    if (!fs.existsSync(resolve("logs"))) {
      fs.mkdirSync(resolve("logs"));
    }

    this.date = new Date();
    this.logFilePath =
      process.env.NODE_ENV === "production" ? resolve(`logs/logs-${this.date.toISOString()}`) : `logs/logs.dev`;
    this.logger = createApplicationLogger(this.logFilePath);
  }

  public info(log: unknown) {
    this.logger.info(log);
  }

  public error(err: Error) {
    this.logger.error(err);
  }
}
export const loggingService = new LoggingService();
