const mongoose = require('mongoose');

const moduleLinkSchema = new mongoose.Schema({
  sourceModule: {
    type: String,
    required: true,
  },
  targetModule: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('ModuleLink', moduleLinkSchema);