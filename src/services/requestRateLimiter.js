const rateLimiter = require("express-rate-limit")

const limiter = rateLimiter.rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 200,
	standardHeaders: 'draft-7',
	legacyHeaders: false,
	message: {message: "Слишком много запросов с этого IP, попробуйте позже."}
})


module.exports = limiter