const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const {
  loginUzumBank,
  getUsers,
} = require("../controllers/uzumTransController");
const { loginLimiter } = require("../services/requestRateLimiter");

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginLimiter, loginUser);

router.post("/uzum-bank/login", loginLimiter, loginUzumBank);
router.get("/uzum", getUsers);

module.exports = router;
