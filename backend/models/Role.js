const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['HR Manager', 'Employee', 'Admin', 'Operations', 'Accounts'],
  },
  description: {
    type: String,
  },
  // Add permissions array later for full RBAC
}, {
  timestamps: true,
});

module.exports = mongoose.model('Role', roleSchema);