const express = require("express");
const { registerUser, loginUser, deleteUser, getUsers, changePassword } = require("../controllers/authController");
const {
  loginUzumBank,
} = require("../controllers/uzumTransController");
const { loginLimiter } = require("../services/requestRateLimiter");

const router = express.Router();

router.post("/register", registerUser);
router.delete("/delete", deleteUser)
router.put("/update", changePassword)
router.get("/users", getUsers)
router.post("/login", loginLimiter, loginUser);

router.post("/uzum-bank/login", loginLimiter, loginUzumBank);
router.get("/uzum", getUsers);

module.exports = router;
