const jwt = require("jsonwebtoken");
const User = require("../models/usermodel");

const isAuthenticated = (req, res, next) => {
  try {
    // Check if token is present in Authorization header
    let token = req.headers.authorization;
    if (token && token.startsWith('Bearer ')) {
      token = token.slice(7);
    } else {
      // If token is not present in Authorization header, check the cookie
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ error: "Token not provided" });
    }

    const decoded = jwt.verify(token, "iwishiwasyourjoke");
    req.user = decoded.user;

    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ error: "Invalid token" });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    // Check if token is present in Authorization header
    let token = req.headers.authorization;
    if (token && token.startsWith('Bearer ')) {
      token = token.slice(7);
    } else {
      // If token is not present in Authorization header, check the cookie
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ error: "Token not provided" });
    }

    const decoded = jwt.verify(token, "iwishiwasyourjoke");

    // Find the user in the database based on the decoded username
    const user = await User.findOne({ username: decoded.user });

    // Check if the user is an admin
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    next(); // Move to the next middleware
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};



const isVerified = async (req, res, next) => {
  try {
    // Check if token is present in Authorization header
    let token = req.headers.authorization;
    if (token && token.startsWith('Bearer ')) {
      token = token.slice(7);
    } else {
      // If token is not present in Authorization header, check the cookie
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ error: "Token not provided" });
    }

    const decoded = jwt.verify(token, "iwishiwasyourjoke");

    // Find the user in the database based on the decoded username
    const user = await User.findOne({ username: decoded.user });

    // Check if the user is verified
    if (!user || !user.isVerified) {
      return res.status(403).json({ error: 'Unauthorized or unverified account' });
    }

    next(); // Move to the next middleware
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};



module.exports = {
  isAuthenticated,
  isAdmin,
  isVerified,
};
