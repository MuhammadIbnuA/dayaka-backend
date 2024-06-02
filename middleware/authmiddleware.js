const jwt = require("jsonwebtoken");
const User = require("../models/usermodel");

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1]; // Extract token from the Authorization header
    const decoded = jwt.verify(token, "iwishiwasyourjoke"); // Verify the token using the secret key

    // Find the user in the database based on the decoded username
    const user = await User.findOne({ username: decoded.user });

    // Check if the user exists and is verified
    if (!user || !user.isVerified) {
      return res.status(403).json({ error: 'Unauthorized or unverified account' });
    }

    // Attach the decoded token and user to the request object
    req.user = user;

    next(); // Move to the next middleware
  } catch (error) {
    console.error(error);
    return res.status(401).json({ error: "Invalid token" });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1]; // Extract token from the Authorization header
    const decoded = jwt.verify(token, "iwishiwasyourjoke"); // Verify the token using the secret key

    // Find the user in the database based on the decoded username
    const user = await User.findOne({ username: decoded.user });

    // Check if the user exists, is verified, and is an admin
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized Youre Not an Admin' });
    }

    next(); // Move to the next middleware
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const isVerified = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1]; // Extract token from the Authorization header
    const decoded = jwt.verify(token, "iwishiwasyourjoke"); // Verify the token using the secret key

    // Find the user in the database based on the decoded username
    const user = await User.findOne({ username: decoded.user });

    // Check if the user exists and is verified
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
