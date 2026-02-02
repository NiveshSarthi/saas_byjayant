const mongoose = require('mongoose');

const appraisalSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  period: {
    type: String,
    required: true,
    enum: ['Quarterly', 'Half-Yearly', 'Annual']
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  ratings: {
    performance: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    skills: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    attitude: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    overall: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    }
  },
  achievements: [{
    type: String
  }],
  areasForImprovement: [{
    type: String
  }],
  goals: [{
    description: String,
    targetDate: Date,
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending'
    }
  }],
  comments: {
    type: String
  },
  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Reviewed', 'Approved'],
    default: 'Draft'
  },
  appraisalLetterGenerated: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Appraisal', appraisalSchema);