const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  bankDetails: {
    accountNumber: String,
    accountHolder: String,
    bankName: String,
    ifsc: String,
    branch: String
  },
  // Add other fields as needed
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);