const rateLimiter = require("express-rate-limit");

const globalLimiter = rateLimiter.rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Слишком много запросов, попробуйте позже." },
});

const loginLimiter = rateLimiter.rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    message:
      "Слишком много попыток входа, попробуйте через 5 минут.",
  },
});

module.exports = { globalLimiter, loginLimiter };
