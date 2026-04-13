const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    maxAge: {
      type: Number,
      required: true,
      unique: true
    },
    coach: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coach'
    },
    trainingDays: [
      {
        type: String,
        enum: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday'
        ]
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Team', teamSchema);