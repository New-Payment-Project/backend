const rateLimiter = require("express-rate-limit");

const globalLimiter = rateLimiter.rateLimit({
  windowMs: 5 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false
});

const loginLimiter = rateLimiter.rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false
});

module.exports = { globalLimiter, loginLimiter };
