const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true, // e.g., 'laptop', 'desk', 'software'
  },
  serialNumber: String,
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
  },
  status: {
    type: String,
    enum: ['Available', 'Assigned', 'Returned', 'Damaged'],
    default: 'Available',
  },
  assignedDate: Date,
  returnDate: Date,
  // Add other fields
}, {
  timestamps: true,
});

module.exports = mongoose.model('Asset', assetSchema);