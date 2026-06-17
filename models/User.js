const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      default: "student",
    },

    isVerified: {
      type: Boolean,
      default: true,
    },

    profilePhoto: {
      type: String,
      default: "",
    },

    department: {
      type: String,
      default: "",
    },

    year: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
    },

    linkedin: {
      type: String,
      default: "",
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    github: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
