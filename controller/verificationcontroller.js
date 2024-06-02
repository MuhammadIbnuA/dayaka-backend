const multer = require("multer");
const VerificationRequest = require("../models/verificationrequestmodel");
const User = require("../models/usermodel");
const { bucket } = require("../firebase");

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Submit a verification request
const submitVerificationRequest = async (req, res) => {
    try {
      const { name, username } = req.body; // Get username from the request body
  
      // Check if the user exists
      const existingUser = await User.findOne({ username });
      if (!existingUser) {
        return res.status(401).json({ error: 'User not found or unauthorized' });
      }
  
      // Check if file exists in the request
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
  
      // Upload image to Firebase Storage
      const imageFileName = `${Date.now()}_${req.file.originalname}`;
      const file = bucket.file(imageFileName);
      const stream = file.createWriteStream({
        metadata: {
          contentType: req.file.mimetype
        }
      });
  
      stream.on('error', (error) => {
        console.error('Error uploading image to Firebase:', error);
        res.status(500).json({ error: 'Error uploading image to Firebase' });
      });
  
      stream.on('finish', async () => {
        // Image uploaded successfully, get download URL
        const idPhotoUrl = `https://storage.googleapis.com/${bucket.name}/${imageFileName}`;
  
        // Create a new verification request
        const newRequest = new VerificationRequest({
          user: username, // Store the username instead of ObjectId
          name,
          idPhotoUrl,
        });
  
        await newRequest.save();
  
        res.json({ message: 'Verification request submitted successfully' });
      });
  
      // Pipe the image data to the Firebase storage stream
      stream.end(req.file.buffer);
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  };

// Get all verification requests (for admin)
const getAllVerificationRequests = async (req, res) => {
    try {
      // Fetch all verification requests
      const requests = await VerificationRequest.find().populate("user", "username");
  
      res.json(requests);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  };


// Approve a verification request (for admin)
const approveVerificationRequest = async (req, res) => {
    try {
      const requestId = req.params.id;
  
      // Find the verification request by ID
      const request = await VerificationRequest.findById(requestId);
      if (!request) {
        return res.status(404).json({ error: 'Verification request not found' });
      }
  
      // Update the request status to approved
      request.status = "approved";
      await request.save();
  
      // Update the user's isVerified field to true
      const user = await User.findOneAndUpdate({ username: request.user }, { isVerified: true });
  
      res.json({ message: 'Verification request approved successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  };
  

// Reject a verification request (for admin)
const rejectVerificationRequest = async (req, res) => {
  try {
    const requestId = req.params.id;

    // Find the verification request by ID
    const request = await VerificationRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ error: 'Verification request not found' });
    }

    // Update the request status to rejected
    request.status = "rejected";
    await request.save();

    res.json({ message: 'Verification request rejected successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  submitVerificationRequest,
  getAllVerificationRequests,
  approveVerificationRequest,
  rejectVerificationRequest,
};
