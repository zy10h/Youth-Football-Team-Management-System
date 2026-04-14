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
    age: {
      type: Number,
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
    guardianName: {
      type: String,
      required: true,
      trim: true
    },
    guardianPhone: {
      type: String,
      trim: true,
      default: ""
    },
    email: {
      type: String,
      trim: true,
      default: ""
    },

    playerPhone: {
      type: String,
      trim: true,
      default: ""
    },
    playerEmail: {
      type: String,
      trim: true,
      default: ""
    },
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

playerSchema.pre("validate", function (next) {
  const hasGuardianEmail = this.email && this.email.trim() !== "";
  const hasGuardianPhone = this.guardianPhone && this.guardianPhone.trim() !== "";

  if (!hasGuardianEmail && !hasGuardianPhone) {
    this.invalidate(
      "email",
      "At least one guardian contact method is required."
    );
  }

  next();
});

module.exports = mongoose.model('Player', playerSchema);