import { Request, Response, NextFunction } from "express";
import { logger } from "./logger.js";

declare global {
  namespace Express {
    interface Request {
      reqId?: string;
      timedOut?: boolean;
      clientDisconnected?: boolean;
    }
  }
}

/**
 * Custom request timeout middleware
 * @param timeoutMs The timeout duration in milliseconds
 * @param operationName Name of the operation being monitored for logging purposes
 */
export function requestTimeout(timeoutMs: number, operationName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const reqId = req.reqId || "N/A";
    
    // Set up the timeout timer
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        req.timedOut = true;
        
        logger.error(`[TIMEOUT] ${operationName} timed out after ${timeoutMs}ms. Aborting request.`, {
          reqId,
          method: req.method,
          url: req.url,
          timeoutMs
        });

        res.status(503).json({
          success: false,
          error: `Request timed out. ${operationName} took too long to respond.`,
          reqId
        });
      }
    }, timeoutMs);

    // Monitor for successful completions to clear the timer
    res.on("finish", () => {
      clearTimeout(timer);
    });

    // Monitor for premature client disconnects
    res.on("close", () => {
      clearTimeout(timer);
      if (!res.headersSent && !req.timedOut) {
        req.clientDisconnected = true;
        logger.warn(`[DISCONNECT] Client prematurely closed connection for ${operationName}`, {
          reqId,
          method: req.method,
          url: req.url
        });
      }
    });

    next();
  };
}

/**
 * Guard utility to throw an error and abort if the request is already timed out or client has disconnected
 */
export function checkAbort(req: Request) {
  if (req.timedOut) {
    const err = new Error("Operation aborted: Request timed out.");
    (err as any).statusCode = 503;
    throw err;
  }
  if (req.clientDisconnected) {
    const err = new Error("Operation aborted: Client disconnected.");
    (err as any).statusCode = 499; // Client Closed Request
    throw err;
  }
}

/**
 * Utility to simulate latency for verification testing of timeouts
 */
export function simulateDelayMiddleware(req: Request, res: Response, next: NextFunction) {
  const delayStr = req.headers["x-simulate-delay"] || req.query.simulate_delay;
  if (delayStr) {
    const delayMs = parseInt(delayStr as string, 10);
    if (!isNaN(delayMs) && delayMs > 0) {
      const reqId = req.reqId || "N/A";
      logger.info(`[SIMULATION] Delaying request processing by ${delayMs}ms`, { reqId, url: req.url });
      setTimeout(() => {
        next();
      }, delayMs);
      return;
    }
  }
  next();
}
