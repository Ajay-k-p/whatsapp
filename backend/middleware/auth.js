const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) return res.status(401).json({ error: "No token provided" });

    const token = authHeader.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "Token missing" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");

    req.user = { id: decoded.id };

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
