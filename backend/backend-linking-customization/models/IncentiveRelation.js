const mongoose = require('mongoose');

const incentiveRelationSchema = new mongoose.Schema({
  salaryComponent: {
    type: String,
    required: true,
  },
  incentiveType: {
    type: String,
    required: true,
  },
  relation: {
    type: String,
    required: true, // e.g., 'linked', 'percentage', etc.
  },
  value: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('IncentiveRelation', incentiveRelationSchema);