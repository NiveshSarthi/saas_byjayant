const mongoose = require('mongoose');

const checklistSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  type: {
    type: String,
    enum: ['daily', 'one-time'],
    required: true,
  },
  items: [{
    item: String,
    completed: {
      type: Boolean,
      default: false,
    },
    attachment: String,
    attachmentName: String,
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  completed: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Checklist', checklistSchema);