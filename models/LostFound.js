const mongoose = require("mongoose");

const lostFoundSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["lost", "found"],
      required: true,
    },

    image: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      default: "open",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LostFound", lostFoundSchema);