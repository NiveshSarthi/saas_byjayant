const mongoose = require('mongoose');

const salesPolicySchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    enum: ['Sales Executive', 'Manager']
  },
  minSales: {
    type: Number,
    default: 0
  },
  maxSales: {
    type: Number,
    default: Infinity
  },
  incentivePercentage: {
    type: Number,
    required: true
  },
  salaryRewardPercentage: {
    type: Number,
    default: 0
  },
  nplIncentive: {
    type: Number,
    default: 0
  },
  normalIncentive: {
    type: Number,
    default: 0
  },
  supportiveSplit: {
    type: Number,
    default: 0
  },
  incentiveUnlockSequence: {
    type: String,
    default: ''
  },
  monthEndLocking: {
    type: Boolean,
    default: true
  },
  ownershipDays: {
    type: Number,
    default: 60
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SalesPolicy', salesPolicySchema);