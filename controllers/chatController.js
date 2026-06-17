const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

// Start Conversation
exports.startConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const otherUserId = req.params.userId;

    let conversation = await Conversation.findOne({
      participants: {
        $all: [userId, otherUserId],
      },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userId, otherUserId],
      });
    }

    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete Message
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    if (message.senderId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    await Message.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get All Conversations
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id,
    })
      .sort({
        lastMessageTime: -1,
      })
      .populate("participants", "name email profilePhoto lastSeen");

    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conversation) => {
        const unreadCount = await Message.countDocuments({
          conversationId: conversation._id,

          senderId: {
            $ne: req.user.id,
          },

          isSeen: false,
        });

        return {
          ...conversation.toObject(),
          unreadCount,
        };
      }),
    );

    res.status(200).json(conversationsWithUnread);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Messages
exports.getMessages = async (req, res) => {
  try {
    await Message.updateMany(
      {
        conversationId: req.params.id,

        senderId: {
          $ne: req.user.id,
        },

        isSeen: false,
      },
      {
        isSeen: true,
      },
    );

    const messages = await Message.find({
      conversationId: req.params.id,
    })
      .populate("senderId", "name email profilePhoto")
      .populate({
        path: "replyTo",
        populate: {
          path: "senderId",
          select: "name profilePhoto",
        },
      })
      .sort({
        createdAt: 1,
      });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Send Text Message
exports.sendMessage = async (req, res) => {
  try {
    const message = await Message.create({
      conversationId: req.body.conversationId,

      senderId: req.user.id,

      text: req.body.text,

      replyTo: req.body.replyTo || null,
    });

    await Conversation.findByIdAndUpdate(req.body.conversationId, {
      lastMessage: req.body.text,

      lastMessageTime: new Date(),
    });

    const populatedMessage = await Message.findById(message._id)
      .populate("senderId", "name email profilePhoto")
      .populate({
        path: "replyTo",
        populate: {
          path: "senderId",
          select: "name profilePhoto",
        },
      });

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};
exports.editMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    if (message.senderId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    message.text = req.body.text;

    message.edited = true;

    await message.save();

    const updatedMessage = await Message.findById(message._id)
      .populate("senderId", "name email profilePhoto")
      .populate({
        path: "replyTo",
        populate: {
          path: "senderId",
          select: "name profilePhoto",
        },
      });

    res.status(200).json(updatedMessage);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
exports.reactToMessage = async (req, res) => {
  try {
    const { emoji } = req.body;

    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    const existingReaction = message.reactions.find(
      (reaction) => reaction.userId.toString() === req.user.id,
    );

    if (existingReaction) {
      existingReaction.emoji = emoji;
    } else {
      message.reactions.push({
        userId: req.user.id,
        emoji,
      });
    }

    await message.save();

    const updatedMessage = await Message.findById(message._id)
      .populate("senderId", "name email profilePhoto")
      .populate({
        path: "replyTo",
        populate: {
          path: "senderId",
          select: "name profilePhoto",
        },
      });

    res.status(200).json(updatedMessage);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
// Send Image Message
exports.sendImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No image uploaded",
      });
    }
    const cleanReplyTo =
      req.body.replyTo && req.body.replyTo !== "null"
        ? req.body.replyTo
        : undefined;

    const message = await Message.create({
      conversationId: req.body.conversationId,

      senderId: req.user.id,

      image: req.file.path,

      replyTo: cleanReplyTo,
    });
    await Conversation.findByIdAndUpdate(req.body.conversationId, {
      lastMessage: "📷 Image",

      lastMessageTime: new Date(),
    });

    const populatedMessage = await Message.findById(message._id)
      .populate("senderId", "name email profilePhoto")
      .populate({
        path: "replyTo",
        populate: {
          path: "senderId",
          select: "name profilePhoto",
        },
      });

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};
exports.searchMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const { query } = req.query;

    const messages = await Message.find({
      conversationId,

      text: {
        $regex: query,
        $options: "i",
      },
    })
      .populate("senderId", "name profilePhoto")
      .sort({
        createdAt: -1,
      });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
exports.deleteForEveryone = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    if (message.senderId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    message.text = "";

    message.image = "";

    message.deletedForEveryone = true;

    await message.save();
    await Conversation.findByIdAndUpdate(message.conversationId, {
      lastMessage: "Message Deleted",
    });
    const updatedMessage = await Message.findById(message._id)
      .populate("senderId", "name email profilePhoto")
      .populate({
        path: "replyTo",
        populate: {
          path: "senderId",
          select: "name profilePhoto",
        },
      });

    res.status(200).json(updatedMessage);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
exports.sendFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const message =
      await Message.create({
        conversationId:
          req.body.conversationId,

        senderId:
          req.user.id,

        fileUrl: req.file.path,

        fileName:
          req.file.originalname,
      });

    await Conversation.findByIdAndUpdate(
      req.body.conversationId,
      {
        lastMessage: "📎 File",
        lastMessageTime: new Date(),
      }
    );

    const populatedMessage =
      await Message.findById(
        message._id
      ).populate(
        "senderId",
        "name email profilePhoto"
      );

    res.status(201).json(
      populatedMessage
    );
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};
