const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const Schema = mongoose.Schema;

const donationSchema = new Schema({
  donation_id: {
    type: String,
    unique: true,
    default: uuidv4,
  },
  campaign_id: {
    type: Schema.Types.ObjectId,
    ref: "Campaign", // Reference to Campaign model
    required: true,
  },
  donor_name: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
  },
  description: {
    type: String,
    required: true,
  },
  message: {
    type: String,
  },
  donated_at: {
    type: Date,
    default: Date.now,
  },
  donationPhoto: {
    type: String,
  },
  news_id: {
    type: String,
    ref: "News", // Reference to News model
  },
  isVerified: {
    type: Boolean,
    default: false, // Default value set to false
  },
});

const Donation = mongoose.model("Donation", donationSchema);

module.exports = Donation;
