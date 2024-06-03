const News = require('../models/newsmodel');
const User = require('../models/usermodel');
const { bucket } = require('../firebase'); // Import Firebase Storage bucket

async function createNews(req, res) {
    try {
        const { title, content, category, author_username } = req.body;

        console.log(`Received author_username: ${author_username}`);

        // Find the author by username
        const author = await User.findOne({ username: author_username });
        if (!author) {
            console.log(`Author not found for username: ${author_username}`);
            return res.status(404).json({ message: 'Author not found' });
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
                contentType: req.file.mimetype
            }
        });

        stream.on('error', (error) => {
            console.error('Error uploading image to Firebase:', error);
            res.status(500).json({ message: 'Error uploading image to Firebase' });
        });

        stream.on('finish', async () => {
            // Image uploaded successfully, get download URL
            const idPhotoUrl = `https://storage.googleapis.com/${bucket.name}/${imageFileName}`;

            // Create a new news article
            const newNews = new News({
                title,
                content,
                category,
                author_username,
                idPhoto: idPhotoUrl // Save the photo URL
            });

            await newNews.save();

            res.status(201).json({ message: 'News article created successfully', newNews });
        });

        // Pipe the image data to the Firebase storage stream
        stream.end(req.file.buffer);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

// Update an existing news article
async function updateNews(req, res) {
    try {
      const { id } = req.params;
      const { title, content, category } = req.body;
  
      const news = await News.findOneAndUpdate(
        { news_id: id },
        { title, content, category, updated_at: Date.now() },
        { new: true }
      );
  
      if (!news) {
        return res.status(404).json({ message: 'News article not found for updating news' });
      }
  
      res.status(200).json({ message: 'News article updated successfully', news });
    } catch (error) {
      res.status(500).json({ message: 'Error updating news article', error });
    }
  }
  
  // Delete a news article
  async function deleteNews(req, res) {
    try {
      const { id } = req.params;
  
      const news = await News.findOneAndDelete({ news_id: id });
  
      if (!news) {
        return res.status(404).json({ message: 'News article not found for deleting news' });
      }
  
      res.status(200).json({ message: 'News article deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting news article', error });
    }
  }
  
  // Get news articles by category
async function getNewsByCategory(req, res) {
    try {
      const { category } = req.params;
  
      // Find news articles by category where approved is true
      const news = await News.find({ category, approved: true });
  
      res.status(200).json(news);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching news by category', error });
    }
  }
  
  // Get all news articles
  async function getAllNews(req, res) {
    try {
      const news = await News.find({ approved: true });
  
      res.status(200).json(news);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching all news', error });
    }
  }
  
  // Approve a news article
  async function approveNews(req, res) {
    try {
      const { id } = req.params;
  
      const news = await News.findOneAndUpdate(
        { news_id: id },
        { approved: true },
        { new: true }
      );
  
      if (!news) {
        return res.status(404).json({ message: 'News article not found for approving news' });
      }
  
      res.status(200).json({ message: 'News article approved successfully', news });
    } catch (error) {
      res.status(500).json({ message: 'Error approving news article', error });
    }
  }

//     async function getNewsById(req, res) {
//     try {
//       const { id } = req.params;
  
//       const news = await News.findOne({ news_id: id });
  
//       if (!news) {
//         return res.status(404).json({ message: 'News article not found for get news by id' });
//       }
  
//       res.status(200).json(news);
//     } catch (error) {
//       res.status(500).json({ message: 'Error fetching news article', error });
//     }
//   }

  // Get news article by ID with approval status
    async function getNewsByIdWithApproved(req, res) {
    try {
      const { id } = req.params;
  
      const news = await News.findOne({ news_id: id, approved: true });
  
      if (!news) {
        return res.status(404).json({ message: 'News article not found or not approved' });
      }
  
      res.status(200).json(news);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching news article', error });
    }
  }
  
  
  // Get news article by ID that is not yet approved
  async function getNewsByIdNotYetApproved(req, res) {
    try {
      const { id } = req.params;
  
      const news = await News.findOne({ news_id: id, approved: false });
  
      if (!news) {
        return res.status(404).json({ message: 'News article not found or already approved' });
      }
  
      res.status(200).json(news);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching news article', error });
    }
  }
  
  module.exports = {
    createNews,
    updateNews,
    deleteNews,
    getNewsByCategory,
    getAllNews,
    // getNewsById,
    approveNews,
    getNewsByIdWithApproved,
    getNewsByIdNotYetApproved
  };
  