const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const newsSchema = new mongoose.Schema({
  news_id: { type: String, unique: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  author_username: { type: String, required: true },
  approved: { type: Boolean, default: false },
  idPhoto: { type: String } // Add idPhoto field
});

// Pre-save middleware to generate a random news_id
newsSchema.pre('save', function(next) {
  if (!this.news_id) {
    this.news_id = uuidv4();
  }
  next();
});

const News = mongoose.model('News', newsSchema);

module.exports = News;
