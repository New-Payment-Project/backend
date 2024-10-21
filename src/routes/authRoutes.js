const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const { loginUzumBank } = require("../controllers/uzumTransController");
const { loginLimiter } = require("../services/requestRateLimiter");

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginLimiter, loginUser);

router.post("/uzum-bank/login", loginUzumBank);

module.exports = router;
