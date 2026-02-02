const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['milk', 'stationery', 'assets', 'other'],
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
  },
  unit: {
    type: String,
    default: 'pieces',
  },
  location: {
    type: String,
  },
  lifecycle: {
    type: String,
    enum: ['available', 'assigned', 'in-use', 'returned', 'disposed'],
    default: 'available',
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  dateAdded: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Inventory', inventorySchema);