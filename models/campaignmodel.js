const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const campaignSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  target: {
    type: String,
    enum: ["Bencana Alam", "Lembaga Amal", "Panti Asuhan"],
    required: true,
  },
  start_date: {
    type: Date,
    required: true,
  },
  end_date: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    enum: [
      "Aceh", "Bali", "Banten", "Bengkulu", "Gorontalo", "Jakarta", "Jambi", "Jawa Barat",
      "Jawa Tengah", "Jawa Timur", "Kalimantan Barat", "Kalimantan Selatan", "Kalimantan Tengah",
      "Kalimantan Timur", "Kalimantan Utara", "Kepulauan Bangka Belitung", "Kepulauan Riau",
      "Lampung", "Maluku", "Maluku Utara", "Nusa Tenggara Barat", "Nusa Tenggara Timur",
      "Papua", "Papua Barat", "Riau", "Sulawesi Barat", "Sulawesi Tenggara", "Sulawesi Tengah",
      "Sulawesi Selatan", "Sulawesi Utara", "Sumatera Barat", "Sumatera Selatan", "Sumatera Utara",
      "Yogyakarta"
    ],
    required: true,
  },
  photo_url: {
    type: String,
  },
  status: {
    type: String,
    enum: ["aktif", "berakhir", "selesai"],
    default: "aktif",
  },
  initiator_username: {
    type: String, // Change to string type
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const Campaign = mongoose.model("Campaign", campaignSchema);

module.exports = Campaign;
