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
const newsController = require ('./controller/newscontroller.js');
const specialcontroller = require ('./controller/getallnewspendingapprove.js');
const veryspecialcontroller = require('./controller/getnewsbyid.js');
const donationController = require('./controller/donationcontroller.js')
const donationnewest = require('./controller/getnewstdonation.js')
const {isVerified, isAdmin, isAuthenticated} = require('./middleware/authmiddleware');

// Define routes
router.get('/campaign/filter', campaignController.getCampaignsFilter); // Route to get campaigns with Filter params
router.get("/campaign/user/:username", campaignController.getCampaignsByUser); // Route to get campaigns by initiator's username
router.get("/campaign/target/:target", campaignController.getCampaignsByTarget); // Route to get campaigns by target enum
router.get("/campaign/location/:location", campaignController.getCampaignsByLocation); // Route to get campaigns by location enum
router.get("/campaign/active", campaignController.getActiveCampaigns); // Route to get active campaigns
router.post("/campaign",campaignController.createCampaign); // Route to create a new campaign
router.put("/campaign/close/:id", campaignController.closeCampaign); // Route to close a campaign by ID
router.put("/campaign/extend/:id", campaignController.extendCampaign); // Route to extend a campaign by ID
router.post("/register", userController.registerUser); // Register a new user
router.post('/google-oauth',userController.googleOAuth);
router.post("/login", userController.login); // Login
router.post("/request-reset", userController.requestPasswordReset); // Request for reset password
router.post('/reset-password', userController.resetPassword); // Resetting Password
// User routes
router.post("/verification-request", upload.single('idPhoto'), verificationController.submitVerificationRequest); // user request verification to admin // tested
// Admin routes
router.get("/verification-requests",isAdmin, verificationController.getAllVerificationRequests); // admin see verification requested 
router.put("/verification-requests/approve/:id",isAdmin, verificationController.approveVerificationRequest); // admin approve request // tested
router.put("/verification-requests/reject/:id",isAdmin, verificationController.rejectVerificationRequest); // admin reject request // tested
// News
router.post('/news',upload.single('file'), newsController.createNews); // post news // tested
router.put('/news/:id', newsController.updateNews); // edit news // tested
router.delete('/news/:id',isAdmin, newsController.deleteNews); // delete news // tested
router.get('/news/category/:category', newsController.getNewsByCategory); // get news by category (only show approved) // tested
router.get('/news', newsController.getAllNews); //get all news while approved true // tested
router.put('/news/approve/:id',isAdmin, newsController.approveNews); // Approval endpoint (admin) // tested
router.get('/news/all/:id',isAdmin, veryspecialcontroller.getNewsById ); // Get news by news ID (admin) // tested
router.get('/news/approved/:id', newsController.getNewsByIdWithApproved); // Get news by news ID with approved status // tested
router.get('/news/pending-approve',isAdmin,specialcontroller.getAllNewsNotYetApproved); // Get all news not yet approved (admin) // tested
router.get('/news/notapproved/:id',isAdmin,newsController.getNewsByIdNotYetApproved); // Get news by news ID not yet approved (admin) // tested
// Donation
router.post("/donations", upload.single('donationPhoto'), donationController.createDonation); // Route to create a new donation with photo upload and optional news association // tested
router.delete("/donations/:id", donationController.deleteDonation); // Route to delete a donation by ID // tested
router.get("/donations", donationController.getAllDonations); // Route to get all donations // tested
router.get("/donations/campaign/:campaign_id", donationController.getAllDonationsByCampaignId); // Route to get all donations by campaign ID // tested
router.get("/donations/:id", donationController.getDonationByDonationId); // Route to get a donation by donation ID // tested
router.patch("/donations/:id/verify", donationController.verifyDonation); // Route to verify a donation // tested
router.get("/latest", donationnewest.getNewestDonations); // Route to get the newest donation // tested solved


// Use the router
app.use('/v1', router);

// Start the server
connectDB();

// Define your routes and middleware here

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});