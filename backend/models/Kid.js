const mongoose = require('mongoose');

const kidSchema = new mongoose.Schema({
  kidName: {
    type: String,
    required: true,
    unique: true,
  },
  countingLevel: {
    type: Number,
    default: 1,
  },
  tapLevel: {
    type: Number,
    default: 1,
  },
  totalSessions: {
    type: Number,
    default: 0,
  },
  totalCorrect: {
    type: Number,
    default: 0,
  },
  lastPlayed: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Kid', kidSchema);