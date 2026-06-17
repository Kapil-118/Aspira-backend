  const mongoose = require("mongoose");

  const messageSchema = new mongoose.Schema(
    {
      conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
        required: true,
      },

      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      text: {
        type: String,
        default: "",
      },

      image: {
        type: String,
        default: "",
      },
      replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
        default: null,
      },
      edited: {
        type: Boolean,
        default: false,
      },
      deletedForEveryone: {
        type: Boolean,
        default: false,
      },
      delivered: {
        type: Boolean,
        default: true,
      },
      fileUrl: {
        type: String,
        default: "",
      },

      fileName: {
        type: String,
        default: "",
      },
      reactions: [
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },

          emoji: String,
        },
      ],
      isSeen: {
        type: Boolean,
        default: false,
      },
    },
    {
      timestamps: true,
    },
  );

  module.exports = mongoose.model("Message", messageSchema);
