const Donation = require("../models/donationmodel");

// Get newest donations
const getNewestDonations = async (req, res) => {
    try {
      console.log('getNewestDonations called');
      const donations = await Donation.find().sort({ donated_at: -1 }).limit(10);
      console.log('Donations found:', donations);
      res.json({ donations });
    } catch (error) {
      console.error('Error in getNewestDonations:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };

  module.exports = {
    getNewestDonations
  }