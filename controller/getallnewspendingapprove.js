const News = require('../models/newsmodel');

// Get all news articles that are not yet approved
async function getAllNewsNotYetApproved(req, res) {
    try {
        let news = await News.find({ approved: false });

        if (!news || news.length === 0) {
            return res.status(404).json({ message: 'No unapproved news articles found' });
        }

        // Check if all retrieved news articles have approved set to false
        const allNotApproved = news.every(article => !article.approved);

        if (!allNotApproved) {
            return res.status(500).json({ message: 'Error fetching news articles: Some articles have approved set to true' });
        }

        res.status(200).json(news);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching news articles', error });
    }
    }

    module.exports = {
        getAllNewsNotYetApproved
      };
      