const mongoose = require('mongoose');

const coachSchema = new mongoose.Schema(
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
    email: {
      type: String,
      trim: true,
      default: ""
    },
    phone: {
      type: String,
      trim: true,
      default: ""
    },
    assignedTeams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team'
      }
    ]
  },
  {
    timestamps: true
  }
);

coachSchema.pre("validate", function (next) {
  const hasEmail = this.email && this.email.trim() !== "";
  const hasPhone = this.phone && this.phone.trim() !== "";

  if (!hasEmail && !hasPhone) {
    this.invalidate(
      "email",
      "Either email or phone is required."
    );
  }

  next();
});

module.exports = mongoose.model('Coach', coachSchema);