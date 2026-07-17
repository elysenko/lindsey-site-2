import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_KEY = 'rate_limit_options';

export interface RateLimitOptions {
  /** Logical action name, stored on RateLimitHit.action. */
  action: string;
  /** Max hits allowed within the window before a 429 is returned. */
  limit: number;
  /** Sliding-window size in minutes. */
  windowMinutes: number;
}

/**
 * Applies a DB-backed sliding-window rate limit (keyed by client IP) to a route.
 * e.g. consultation submissions: @RateLimit({ action: 'consultation', limit: 5, windowMinutes: 60 })
 */
export const RateLimit = (options: RateLimitOptions) =>
  SetMetadata(RATE_LIMIT_KEY, options);
