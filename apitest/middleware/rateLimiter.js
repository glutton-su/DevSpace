import rateLimit from "express-rate-limit";

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"); // 15 min
const max = parseInt(process.env.RATE_LIMIT_MAX || "1000");               // 1000 reqs

export const apiLimiter = rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many requests, please try again later.",
    code: "RATE_LIMIT",
  },
});