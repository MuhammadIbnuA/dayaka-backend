const News = require('../models/newsmodel');

async function getNewsById(req, res) {
    try {
      const { id } = req.params;
  
      const news = await News.findOne({ news_id: id });
  
      if (!news) {
        return res.status(404).json({ message: 'News article not found for get news by id' });
      }
  
      res.status(200).json(news);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching news article', error });
    }
  }

  module.exports = {
    getNewsById
  };