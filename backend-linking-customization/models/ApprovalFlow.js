const mongoose = require('mongoose');

const approvalFlowSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  steps: [{
    role: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('ApprovalFlow', approvalFlowSchema);