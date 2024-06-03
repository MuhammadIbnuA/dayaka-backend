const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  resetPasswordToken: {
    type: String,
    default: '',
  },
  isAdmin: {
    type: Boolean,
    default: false,
    required: true,
  },
  provider: {
    type: String,
    required: true,
  },
  providerId: {
    type: String,
    required: true,
    unique: true,
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
