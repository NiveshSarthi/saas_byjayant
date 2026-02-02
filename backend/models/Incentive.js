const mongoose = require('mongoose');

const incentiveSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  deal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deal',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  isLocked: {
    type: Boolean,
    default: true
  },
  approved: {
    type: Boolean,
    default: false
  },
  released: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Incentive', incentiveSchema);