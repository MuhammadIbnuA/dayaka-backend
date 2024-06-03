const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const User = require("../models/usermodel");
const { admin } = require("../firebase");

// Register a new user
const registerUser = async (req, res) => {
  try {
    const { username, password, email, provider, providerId } = req.body;

    // Check if username or email already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash the password if registering conventionally
    let hashedPassword = '';
    if (provider !== 'google') {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Create a new user
    const newUser = new User({
      username,
      password: hashedPassword, // Store the hashed password if registering conventionally
      email,
      provider,
      providerId,
    });

    // Save the user to the database
    await newUser.save();

    res.json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Login logic
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Compare the password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ user: user.username }, 'iwishiwasyourjoke', { expiresIn: '1h' });

    // Set the JWT token as a cookie
    res.cookie('token', token, { maxAge: 3600000, httpOnly: true }); // Expiry set to 1 hour (3600000 milliseconds)

    // Return the token as a response
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Generate OTP and send email
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User with this email does not exist" });
    }

    // Generate OTP
    const otp = crypto.randomBytes(3).toString("hex"); // Generates a 6-digit OTP

    // Save OTP as a token in the database (hashed for security)
    user.resetPasswordToken = await bcrypt.hash(otp, 10);
    await user.save();

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL, // Your email address from environment variable
        pass: process.env.EMAIL_PASSWORD, // Your email password from environment variable
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "OTP sent to email" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};


// Verify OTP and reset password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User with this email does not exist" });
    }

    // Verify the OTP
    const isOtpValid = await bcrypt.compare(otp, user.resetPasswordToken);
    if (!isOtpValid) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // Hash the new password and save it
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = ''; // Clear the reset token
    await user.save();

    res.json({ message: "Password has been reset" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Google OAuth logic
const googleOAuth = async (req, res) => {
  const { idToken } = req.body;

  try {
    // Verify the ID token using Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name } = decodedToken;

    let user = await User.findOne({ email });
    if (!user) {
      // Create a new user if not exists
      user = new User({
        username: name,
        email: email,
        isVerified: true,
        provider: 'google',
        providerId: uid,
      });
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign({ user: user.username }, 'iwishiwasyourjoke', { expiresIn: '1h' });

    // Return the token and user as a response
    res.json({ token, user });
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
};

module.exports = {
  registerUser,
  login,
  requestPasswordReset,
  resetPassword,
  googleOAuth
};
