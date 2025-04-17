const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("JWT Verification Error:", err);
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    
    // Ensure decoded token has required fields
    if (!decoded.userId) {
      return res.status(403).json({ error: "Token missing user ID" });
    }
    
    // Standardize user object
    req.user = {
      userId: decoded.userId,
      name: decoded.name || null,
      email: decoded.email || null
    };
    
    console.log('Authenticated user:', req.user); // Debug log
    next();
  });
};

module.exports = { authenticateToken };