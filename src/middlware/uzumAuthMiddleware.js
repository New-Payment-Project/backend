const bcrypt = require('bcryptjs');
const User = require("../models/userModel");

const uzumAuthMiddleware = async (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return res
      .status(401)
      .json({ message: "Authorization token missing or malformed" });
  }

  const base64Credentials = authHeader.split(" ")[1];

  const credentials = Buffer.from(base64Credentials, "base64").toString("ascii");

  const [login, password] = credentials.split(":");

  try {
    const user = await User.findOne({ login: login });

    if (!user) {
      return res.status(401).json({ message: "Invalid login or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid login or password" });
    }

    req.user = { login };

    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server response error. Try again later" });
  }
};

module.exports = uzumAuthMiddleware;
