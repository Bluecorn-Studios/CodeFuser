import { logger } from "./logger.js";

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  factor?: number;
  jitter?: boolean;
  reqId?: string;
  operationName?: string;
  isIdempotent?: boolean;
}

export class NonTransientError extends Error {
  public originalError: any;
  constructor(message: string, originalError?: any) {
    super(message);
    this.name = "NonTransientError";
    this.originalError = originalError;
  }
}

/**
 * Determine if an error is transient and safe to retry.
 */
export function isTransientError(error: any, isIdempotent: boolean = true): boolean {
  if (!error) return false;

  // If it's explicitly marked as non-transient, never retry
  if (error instanceof NonTransientError || error.name === "NonTransientError") {
    return false;
  }

  const message = (error.message || "").toLowerCase();
  const code = (error.code || "").toUpperCase();
  const status = error.status || error.statusCode || error.response?.status;

  // 1. Authorization/Authentication failures are NOT transient
  if (
    status === 401 ||
    status === 403 ||
    message.includes("jwt") ||
    message.includes("unauthorized") ||
    message.includes("invalid api key") ||
    message.includes("invalid_key") ||
    message.includes("key_invalid") ||
    message.includes("forbidden")
  ) {
    return false;
  }

  // 2. Validation failures are NOT transient
  if (
    status === 400 ||
    status === 422 ||
    message.includes("validation") ||
    message.includes("violates") ||
    message.includes("constraint") ||
    message.includes("not-null") ||
    message.includes("invalid input syntax") ||
    message.includes("duplicate key") ||
    code.includes("P2002") || // Prisma duplicate key
    code === "23505" // Postgres unique_violation
  ) {
    return false;
  }

  // 3. Client timeout rules (CRITICAL constraint)
  // "Never retry after timeout if operation may already have succeeded"
  // If we timed out (HTTP 408 / 504 or local Abort/Timeout error) and the operation is non-idempotent (e.g. INSERT),
  // it might have already succeeded on the remote server.
  const isTimeout =
    status === 408 ||
    status === 504 ||
    message.includes("timeout") ||
    message.includes("timed out") ||
    message.includes("abort") ||
    code.includes("timeout") ||
    code === "ETIMEDOUT";

  if (isTimeout && !isIdempotent) {
    logger.warn("Skipping retry for timed out non-idempotent operation to prevent duplication.", {
      error: error.message || error,
    });
    return false;
  }

  // 4. Rate limiting (429) is a classic transient failure (safe to retry with backoff)
  if (status === 429 || message.includes("rate limit") || message.includes("too many requests")) {
    return true;
  }

  // 5. Classic network transient failures
  const transientNetworkCodes = [
    "ECONNRESET",
    "EPIPE",
    "ENOTFOUND",
    "ECONNREFUSED",
    "EHOSTUNREACH",
    "EAI_AGAIN",
    "ETIMEDOUT",
  ];

  if (transientNetworkCodes.includes(code)) {
    return true;
  }

  if (
    message.includes("socket hang up") ||
    message.includes("fetch failed") ||
    message.includes("dns resolution") ||
    message.includes("network error") ||
    message.includes("connection reset") ||
    message.includes("bad gateway") ||
    message.includes("service unavailable") ||
    status === 502 ||
    status === 503 ||
    status === 500 // Generic server error can often be retried
  ) {
    return true;
  }

  // Default: if in doubt and it's idempotent, we can try retrying. If non-idempotent, we default to false for safety.
  return isIdempotent;
}

/**
 * Reusable retry executor with exponential backoff and random jitter.
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const maxRetries = options.maxRetries ?? 3;
  const initialDelayMs = options.initialDelayMs ?? 500;
  const maxDelayMs = options.maxDelayMs ?? 5000;
  const factor = options.factor ?? 2;
  const jitter = options.jitter ?? true;
  const reqId = options.reqId || "N/A";
  const operationName = options.operationName || "Operation";
  const isIdempotent = options.isIdempotent ?? true;

  let attempt = 0;

  while (true) {
    try {
      return await operation();
    } catch (error: any) {
      attempt++;

      // Check if we can retry
      const canRetry = attempt <= maxRetries && isTransientError(error, isIdempotent);

      if (!canRetry) {
        if (attempt > maxRetries) {
          logger.error(`[RETRY EXHAUSTED] ${operationName} failed after ${attempt} attempts.`, error, {
            reqId,
            attempt,
            maxRetries,
          });
        } else {
          logger.warn(`[RETRY ABORTED] ${operationName} failed with non-transient error. Will not retry.`, {
            reqId,
            error: error.message || error,
            attempt,
          });
        }
        throw error;
      }

      // Calculate exponential backoff with optional jitter
      const baseDelay = initialDelayMs * Math.pow(factor, attempt - 1);
      let delay = Math.min(baseDelay, maxDelayMs);

      if (jitter) {
        // Full jitter: random between 50% and 150% of the calculated delay
        const jitterMultiplier = 0.5 + Math.random();
        delay = Math.round(delay * jitterMultiplier);
      }

      logger.warn(
        `[RETRY ATTEMPT ${attempt}/${maxRetries}] ${operationName} failed. Retrying in ${delay}ms...`,
        {
          reqId,
          attempt,
          maxRetries,
          delayMs: delay,
          error: error.message || String(error),
        }
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
