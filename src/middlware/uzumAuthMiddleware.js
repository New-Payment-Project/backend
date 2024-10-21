const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET; 

const uzumAuthMiddleware = async (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Authorization token missing or malformed" });
  }

  const token = authHeader.split(" ")[1]; 

  try {
    const decoded = jwt.verify(token, secretKey);

    req.user = decoded.user;
    next();  
  } catch (error) {
    console.log(error);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

module.exports = uzumAuthMiddleware;
