const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const router = require("express").Router();
const connectDB = require('./database.js'); // Adjust the path if needed
const multer =require('multer');

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Use the port from environment variables or default to 3001
const port = process.env.PORT || 3001;

// Controllers and Middleware
const userController = require("./controller/usercontroller");
const campaignController = require("./controller/campaigncontroller");
const verificationController = require("./controller/verificationcontroller.js");
const {isVerified, isAdmin, isAuthenticated} = require('./middleware/authmiddleware');

// Define routes
router.get('/campaign/filter', campaignController.getCampaignsFilter); // Route to get campaigns with Filter params
router.get("/campaign/user/:username", campaignController.getCampaignsByUser); // Route to get campaigns by initiator's username
router.get("/campaign/target/:target", campaignController.getCampaignsByTarget); // Route to get campaigns by target enum
router.get("/campaign/location/:location", campaignController.getCampaignsByLocation); // Route to get campaigns by location enum
router.get("/campaign/active", campaignController.getActiveCampaigns); // Route to get active campaigns
router.post("/campaign", isVerified,campaignController.createCampaign); // Route to create a new campaign
router.put("/campaign/close/:id", campaignController.closeCampaign); // Route to close a campaign by ID
router.put("/campaign/extend/:id", campaignController.extendCampaign); // Route to extend a campaign by ID
router.post("/register", userController.registerUser); // Register a new user
router.post("/login", userController.login); // Login
router.post("/request-reset", userController.requestPasswordReset); // Request for reset password
router.post('/reset-password', userController.resetPassword); // Resetting Password
// User routes
router.post("/verification-request", upload.single('idPhoto'), verificationController.submitVerificationRequest);
// Admin routes
router.get("/verification-requests",isAdmin, verificationController.getAllVerificationRequests);
router.put("/verification-requests/approve/:id",isAdmin, verificationController.approveVerificationRequest);
router.put("/verification-requests/reject/:id",isAdmin, verificationController.rejectVerificationRequest);


// Use the router
app.use('/v1', router);

// Start the server
connectDB();

// Define your routes and middleware here

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});