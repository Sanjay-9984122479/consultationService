const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) return res.status(401).json({ message: "No token, authorization denied" });

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log(decoded,"decoded");
    next();
  } catch (error) {
    res.status(401).json({ message: error });
  }
};

module.exports = authMiddleware;
