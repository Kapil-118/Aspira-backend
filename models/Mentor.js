const mongoose = require("mongoose");

const mentorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  name: {
    type: String,
    required: true
  },

  skills: [{
    type: String
  }],

  year: {
    type: Number
  },

  bio: {
    type: String
  }

}, { timestamps: true });

module.exports = mongoose.model("Mentor", mentorSchema);