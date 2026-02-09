const mongoose = require('mongoose');

const moduleConfigSchema = new mongoose.Schema({
  moduleName: {
    type: String,
    required: true,
    unique: true,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('ModuleConfig', moduleConfigSchema);