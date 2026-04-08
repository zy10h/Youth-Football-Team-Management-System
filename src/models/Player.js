const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    dateOfBirth: {
      type: Date,
      required: true
    },
    preferredPosition: {
      type: String
    },
    alternativePositions: [
      {
        type: String
      }
    ],
    jerseyNumber: {
      type: Number,
      min: 1,
      max: 99
    },
    guardianName: String,
    guardianPhone: String,
    email: String,
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Player', playerSchema);