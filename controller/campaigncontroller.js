const Campaign = require("../models/campaignmodel");
const User = require("../models/usermodel");
const Donation = require("../models/donationmodel");

// Create a new campaign
const createCampaign = async (req, res) => {
  try {
    const { title, description, target, start_date, end_date, location, photo_url, initiator_username } = req.body;

    // Find the user by username
    const user = await User.findOne({ username: initiator_username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create a new campaign with the initiator's username
    const newCampaign = new Campaign({
      title,
      description,
      target,
      start_date,
      end_date,
      location,
      photo_url,
      initiator_username: user.username, // Use the user's username as initiator_username
    });

    await newCampaign.save();

    res.json({ message: 'Campaign created successfully', campaign: newCampaign });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Close a campaign by ID
const closeCampaign = async (req, res) => {
  try {
    const campaignId = req.params.id;

    const closedCampaign = await Campaign.findOneAndUpdate(
      { campaign_id: campaignId },
      { status: "berakhir" },
      { new: true }
    );

    if (!closedCampaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    res.json({ message: "Campaign closed successfully", campaign: closedCampaign });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Extend a campaign by ID
const extendCampaign = async (req, res) => {
  try {
    const campaignId = req.params.id;
    const { end_date } = req.body;

    const extendedCampaign = await Campaign.findOneAndUpdate(
      { campaign_id: campaignId },
      { end_date },
      { new: true }
    );

    if (!extendedCampaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    res.json({ message: "Campaign extended successfully", campaign: extendedCampaign });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get campaigns by initiator's username
const getCampaignsByUser = async (req, res) => {
  try {
    const { username } = req.params;

    const campaigns = await Campaign.find({ initiator_username: username }).populate('donations');

    res.json({ campaigns });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get campaigns by target enum
const getCampaignsByTarget = async (req, res) => {
  try {
    const { target } = req.params;

    const campaigns = await Campaign.find({ target }).populate('donations');

    res.json({ campaigns });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get campaigns by location enum
const getCampaignsByLocation = async (req, res) => {
  try {
    const { location } = req.params;

    const campaigns = await Campaign.find({ location }).populate('donations');

    res.json({ campaigns });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get campaigns that are still active (current date is between start and end date)
const getActiveCampaigns = async (req, res) => {
  try {
    const currentDate = new Date();

    const activeCampaigns = await Campaign.find({
      start_date: { $lte: currentDate },
      end_date: { $gte: currentDate },
    }).populate('donations');

    res.json({ campaigns: activeCampaigns });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get campaigns with optional filters
const getCampaignsFilter = async (req, res) => {
  try {
    const { target, location, active } = req.query;
    const query = {};

    if (target) {
      query.target = target;
    }

    if (location) {
      query.location = location;
    }

    if (active !== undefined) {
      const currentDate = new Date();
      if (active === 'true') {
        query.start_date = { $lte: currentDate };
        query.end_date = { $gte: currentDate };
      } else if (active === 'false') {
        query.$or = [
          { end_date: { $lt: currentDate } },
          { start_date: { $gt: currentDate } }
        ];
      }
    }

    const campaigns = await Campaign.find(query).populate('donations');
    res.json({ campaigns });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  createCampaign,
  closeCampaign,
  extendCampaign,
  getCampaignsByUser,
  getCampaignsByTarget,
  getCampaignsByLocation,
  getActiveCampaigns,
  getCampaignsFilter
};
