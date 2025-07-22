const mongoose = require('mongoose');

const PermissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  is_active: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Permission', PermissionSchema);
