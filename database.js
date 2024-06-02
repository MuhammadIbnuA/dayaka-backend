require('dotenv').config();
const mongoose = require('mongoose');

const connectionString = process.env.MONGODB_URI;

if (!connectionString.startsWith('mongodb+srv://')) {
  console.error('Invalid MongoDB URI. It should start with "mongodb+srv://".');
  process.exit(1); // Exit the process with failure
}

const connectDB = async () => {
  try {
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1); // Exit the process with failure
  }
};

module.exports = connectDB;
