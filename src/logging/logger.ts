import { createLogger, format, transports } from "winston";

export function createApplicationLogger(filename: string) {
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
