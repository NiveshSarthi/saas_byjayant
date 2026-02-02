const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  dealValue: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['NPL', 'Normal'],
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  isSupportive: {
    type: Boolean,
    default: false
  },
  cvCount: {
    type: Number,
    default: 0
  },
  numberOfSales: {
    type: Number,
    required: true
  },
  builderPaymentReceived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Deal', dealSchema);