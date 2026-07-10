import crypto from "crypto";

export const logger = {
  info(message: string, meta?: any) {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "INFO",
      message,
      ...meta
    }));
  },
  warn(message: string, meta?: any) {
    console.warn(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "WARN",
      message,
      ...meta
    }));
  },
  error(message: string, error?: any, meta?: any) {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "ERROR",
      message,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
      ...meta
    }));
  },
  debug(message: string, meta?: any) {
    if (process.env.NODE_ENV !== "production") {
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "DEBUG",
        message,
        ...meta
      }));
    }
  }
};
