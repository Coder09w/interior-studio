/**
 * Simple in-memory rate limiter for API routes.
 * 
 * For production, consider using Upstash Redis or similar for distributed rate limiting.
 * This implementation uses a sliding window counter per IP address.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetTime) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitOptions {
  /** Maximum number of requests allowed in the window */
  limit: number;
  /** Time window in milliseconds */
  windowMs: number;
}

/** Pre-configured rate limits for different endpoint types */
export const RATE_LIMITS = {
  /** Auth endpoints: 5 requests per 15 minutes (brute-force protection) */
  auth: { limit: 5, windowMs: 15 * 60 * 1000 },
  /** Registration: 3 per hour (account creation abuse) */
  register: { limit: 3, windowMs: 60 * 60 * 1000 },
  /** Password reset: 3 per hour (email bombing prevention) */
  passwordReset: { limit: 3, windowMs: 60 * 60 * 1000 },
  /** Write endpoints (projects, rooms): 30 per minute */
  write: { limit: 30, windowMs: 60 * 1000 },
  /** Read endpoints: 60 per minute */
  read: { limit: 60, windowMs: 60 * 1000 },
} as const;

/**
 * Check if a request should be rate limited.
 * Returns { limited: true, retryAfter } if rate limited, or { limited: false } if allowed.
 */
export function checkRateLimit(
  ip: string,
  options: RateLimitOptions
): { limited: false } | { limited: true; retryAfter: number } {
  const now = Date.now();
  const key = `${ip}:${options.limit}:${options.windowMs}`;

  const entry = store.get(key);

  if (!entry || now > entry.resetTime) {
    // No entry or window expired — start fresh
    store.set(key, {
      count: 1,
      resetTime: now + options.windowMs,
    });
    return { limited: false };
  }

  if (entry.count >= options.limit) {
    // Rate limited — calculate how long until the window resets
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return { limited: true, retryAfter };
  }

  // Increment the counter
  entry.count += 1;
  return { limited: false };
}

/**
 * Extract client IP from request headers.
 * Works with reverse proxies (Caddy, Nginx, Cloudflare, etc.)
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // x-forwarded-for may contain multiple IPs, first is the client
    return forwarded.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  // Fallback for direct connections
  return "unknown";
}

/**
 * Apply rate limiting to an API route handler.
 * Returns a NextResponse with 429 status if rate limited, or null if allowed.
 * 
 * Usage:
 * ```ts
 * const rateLimitResponse = applyRateLimit(request, RATE_LIMITS.auth);
 * if (rateLimitResponse) return rateLimitResponse;
 * ```
 */
import { NextResponse } from "next/server";

export function applyRateLimit(
  request: Request,
  options: RateLimitOptions
): NextResponse | null {
  const ip = getClientIp(request);
  const result = checkRateLimit(ip, options);

  if (result.limited) {
    return NextResponse.json(
      {
        error: "Too many requests. Please try again later.",
        retryAfter: result.retryAfter,
      },
      {
        status: 429,
        headers: {
          "Retry-After": result.retryAfter.toString(),
          "X-RateLimit-Limit": options.limit.toString(),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  return null;
}
