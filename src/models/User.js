const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  userType: {
    type: String,
    required: true,
    enum: ['hotel', 'ngo']
  },
  // Hotel specific fields
  businessName: String,
  phone: String,
  // NGO specific fields
  organizationName: String,
  registrationNumber: String,
  contactPerson: String,
  // Common fields
  address: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema); 