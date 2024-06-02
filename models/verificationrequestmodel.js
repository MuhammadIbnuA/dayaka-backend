const mongoose = require("mongoose");

const verificationRequestSchema = new mongoose.Schema({
  user: {
    type: String, // Changed type to String for username reference
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  idPhotoUrl: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const VerificationRequest = mongoose.model("VerificationRequest", verificationRequestSchema);

module.exports = VerificationRequest;
