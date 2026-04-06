const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    ageGroup: {
      type: String,
      required: true,
      trim: true
    },
    minAge: {
      type: Number,
      required: true
    },
    maxAge: {
      type: Number,
      required: true
    },
    coach: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coach'
    },
    trainingDay: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Team', teamSchema);