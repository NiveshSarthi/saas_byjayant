const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: String,
  resume: String, // file path
  stage: {
    type: String,
    enum: ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'],
    default: 'Applied',
  },
  notes: String,
  atsScore: {
    type: Number,
    default: 0,
  },
  // Add other fields
});

const recruitmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  position: String,
  level: String,
  numberOfPositions: {
    type: Number,
    default: 1,
  },
  targetDate: Date,
  description: {
    type: String,
    required: true, // JD
  },
  requirements: String,
  department: String,
  candidates: [candidateSchema],
  stages: {
    type: [String],
    default: ['Applied', 'Screening', 'Interview', 'Offer', 'Hired'],
  },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open',
  },
  closedDate: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  // Add other fields
}, {
  timestamps: true,
});

module.exports = mongoose.model('Recruitment', recruitmentSchema);