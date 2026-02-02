const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true, // e.g., 'resume', 'contract', 'id'
  },
  filePath: {
    type: String,
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
  },
  // For recruitment documents, perhaps add recruitment ref
  recruitment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recruitment',
  },
  // Add other fields
}, {
  timestamps: true,
});

module.exports = mongoose.model('Document', documentSchema);