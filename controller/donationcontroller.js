const Donation = require("../models/donationmodel");
const Campaign = require("../models/campaignmodel");
const News = require("../models/newsmodel");
const User = require('../models/usermodel');
const { bucket } = require("../firebase");

// Create a new donation with photo upload and optional news association
const createDonation = async (req, res) => {
  try {
    const { campaign_id, donor_name, amount, description, message, news_id } = req.body;

    // Check if the user exists with the provided donor_name (username)
    const donor = await User.findOne({ username: donor_name });
    if (!donor) {
      return res.status(404).json({ error: 'Donor not found' });
    }

    // Find the campaign by campaign_id
    const campaign = await Campaign.findOne({ campaign_id });
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Check if the news ID is provided and valid
    if (news_id) {
      const news = await News.findOne({ news_id });
      if (!news) {
        return res.status(404).json({ error: 'News not found' });
      }
    }

    // Check if file exists in the request
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload image to Firebase Storage
    const imageFileName = `${Date.now()}_${req.file.originalname}`;
    const file = bucket.file(imageFileName);
    const stream = file.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    stream.on('error', (error) => {
      console.error('Error uploading image to Firebase:', error);
      res.status(500).json({ message: 'Error uploading image to Firebase' });
    });

    stream.on('finish', async () => {
      // Image uploaded successfully, get download URL
      const donationPhotoUrl = `https://storage.googleapis.com/${bucket.name}/${imageFileName}`;

      // Create a new donation
      const newDonation = new Donation({
        campaign_id: campaign._id, // Use campaign's ObjectId
        donor_name: donor.username, // Use donor's username
        amount,
        description,
        message,
        donationPhoto: donationPhotoUrl, // Save the photo URL
        news_id, // Associate news_id if provided
        // isVerified will be false by default
      });

      await newDonation.save();

      // Add the new donation to the campaign's donations array
      campaign.donations.push(newDonation._id);
      await campaign.save();

      res.status(201).json({ message: 'Donation created successfully', donation: newDonation });
    });

    // Pipe the image data to the Firebase storage stream
    stream.end(req.file.buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};


// Delete a donation by ID
const deleteDonation = async (req, res) => {
  try {
    const { id } = req.params;

    const donation = await Donation.findOneAndDelete({ donation_id: id });

    if (!donation) {
      return res.status(404).json({ error: 'Donation not found on deleting donation' });
    }

    // Remove the donation from the campaign's donations array
    await Campaign.updateOne(
      { _id: donation.campaign_id },
      { $pull: { donations: donation._id } }
    );

    res.json({ message: 'Donation deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all donations
const getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find();
    res.json({ donations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getAllDonationsByCampaignId = async (req, res) => {
  try {
    const { campaign_id } = req.params;
    const campaign = await Campaign.findOne({ campaign_id }).populate('donations');

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found from get all donations by campaign id' });
    }

    // Ensure that donations are correctly populated
    const donations = await Donation.find({ campaign_id: campaign._id });
    res.json({ donations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};


// Get a donation by donation ID
const getDonationByDonationId = async (req, res) => {
  try {
    const { id } = req.params;
    const donation = await Donation.findOne({ donation_id: id });

    if (!donation) {
      return res.status(404).json({ error: 'Donation not found from donation by id' });
    }

    res.json({ donation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Verify a donation
const verifyDonation = async (req, res) => {
  try {
    const { id } = req.params;

    const donation = await Donation.findOneAndUpdate(
      { donation_id: id },
      { isVerified: true },
      { new: true }
    );

    if (!donation) {
      return res.status(404).json({ error: 'Donation not found on verify' });
    }

    res.json({ message: 'Donation verified successfully', donation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// // Get newest donations
// const getNewestDonations = async (req, res) => {
//   try {
//     console.log('getNewestDonations called');
//     const donations = await Donation.find().sort({ donated_at: -1 }).limit(10);
//     console.log('Donations found:', donations);
//     res.json({ donations });
//   } catch (error) {
//     console.error('Error in getNewestDonations:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// };


module.exports = {
  createDonation,
  deleteDonation,
  getAllDonations,
  getAllDonationsByCampaignId,
  getDonationByDonationId,
  verifyDonation,
  // getNewestDonations,
};
