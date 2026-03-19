import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Generate: 10 requests per day per user
export const generateRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 d"),
  prefix: "ratelimit:generate",
});

// Converse: 100 requests per hour per user (per interview session)
export const converseRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 h"),
  prefix: "ratelimit:converse",
});
