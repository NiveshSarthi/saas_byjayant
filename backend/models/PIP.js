const mongoose = require('mongoose');

const pipSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  initiatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    required: true,
    enum: ['Performance Issues', 'Attendance Issues', 'Behavioral Issues', 'Skill Gaps', 'Other']
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  objectives: [{
    description: String,
    targetDate: Date,
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed', 'Failed'],
      default: 'Not Started'
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  }],
  supportProvided: [{
    type: String,
    description: String,
    date: Date
  }],
  reviews: [{
    date: Date,
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    comments: String,
    progress: Number,
    nextSteps: String
  }],
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Terminated', 'Extended'],
    default: 'Active'
  },
  outcome: {
    type: String,
    enum: ['Successful', 'Unsuccessful', 'Resigned', 'Terminated'],
    required: function() {
      return this.status === 'Completed' || this.status === 'Terminated';
    }
  },
  finalComments: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PIP', pipSchema);