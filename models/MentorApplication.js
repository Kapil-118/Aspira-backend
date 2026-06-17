const mongoose = require("mongoose");

const mentorApplicationSchema =
  new mongoose.Schema(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      name: {
        type: String,
        required: true,
      },

      department: {
        type: String,
        required: true,
      },

      year: {
        type: String,
        required: true,
      },

      skills: [
        {
          type: String,
        },
      ],

      bio: {
        type: String,
        required: true,
      },

      status: {
        type: String,
        enum: [
          "pending",
          "approved",
          "rejected",
        ],
        default: "pending",
      },
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "MentorApplication",
    mentorApplicationSchema
  );