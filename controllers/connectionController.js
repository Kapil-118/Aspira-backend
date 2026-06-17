const ConnectionRequest = require("../models/ConnectionRequest");
const Mentor = require("../models/Mentor");
const Conversation = require("../models/Conversation");
const Notification = require("../models/Notification");
const User = require("../models/User");
// Send Connection Request
exports.sendRequest = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.mentorId);

    if (!mentor) {
      return res.status(404).json({
        message: "Mentor not found",
      });
    }

    const existing = await ConnectionRequest.findOne({
      studentId: req.user.id,
      mentorId: req.params.mentorId,
    });

    if (existing) {
      return res.status(400).json({
        message: "Request already exists",
      });
    }

    const request = await ConnectionRequest.create({
      studentId: req.user.id,
      mentorId: req.params.mentorId,
    });
    const Notification = require("../models/Notification");

    await Notification.create({
      user: mentor.userId,
      title: "New Connection Request",
      message: "A student sent you a connection request.",
    });
    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");

    const mentorSocket = onlineUsers[mentor.userId.toString()];

    if (mentorSocket) {
      io.to(mentorSocket).emit("newNotification", {
        title: "New Connection Request",
        message: "A student sent you a connection request.",
      });
    }

    const student = await User.findById(req.user.id);

    await Notification.create({
      recipient: mentor.userId,
      sender: req.user.id,
      type: "request_sent",
      text: `${student.name} sent you a mentor request`,
    });

    res.status(201).json(request);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// Student Requests
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await ConnectionRequest.find({
      studentId: req.user.id,
      status: "accepted",
    })
      .populate({
        path: "mentorId",
        populate: {
          path: "userId",
          select: "profilePhoto email",
        },
      })
      .sort({
        createdAt: -1,
      });

    res.status(200).json(requests);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// Accepted Connections
exports.getMyConnections = async (req, res) => {
  try {
    const requests = await ConnectionRequest.find({
      studentId: req.user.id,
      status: "accepted",
    }).populate({
      path: "mentorId",
      populate: {
        path: "userId",
        select: "profilePhoto email",
      },
    });

    res.status(200).json(requests);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// Mentor Incoming Requests
exports.getMentorRequests = async (req, res) => {
  try {
    const mentor = await Mentor.findOne({
      userId: req.user.id,
    });

    if (!mentor) {
      return res.status(404).json({
        message: "Mentor profile not found",
      });
    }

    const requests = await ConnectionRequest.find({
      mentorId: mentor._id,
    })
      .populate("studentId", "name email profilePhoto")
      .sort({
        createdAt: -1,
      });

    res.status(200).json(requests);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// Accept Request
exports.acceptRequest = async (req, res) => {
  try {
    const request = await ConnectionRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        message: "Request already processed",
      });
    }

    request.status = "accepted";

    await request.save();
    const Notification = require("../models/Notification");

    await Notification.create({
      user: request.studentId,
      title: "Request Accepted",
      message: "Your mentor request has been accepted.",
    });
    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");

    const studentSocket = onlineUsers[request.studentId.toString()];

    if (studentSocket) {
      io.to(studentSocket).emit("newNotification", {
        title: "Request Accepted",
        message: "Your mentor request has been accepted.",
      });
    }
    const mentorUser = await User.findById(req.user.id);

    await Notification.create({
      recipient: request.studentId,
      sender: req.user.id,
      type: "request_accepted",
      text: `${mentorUser.name} accepted your mentor request`,
    });
    const mentor = await Mentor.findById(request.mentorId);

    console.log("Student:", request.studentId);

    console.log("Mentor User:", mentor.userId);

    const existingConversation = await Conversation.findOne({
      participants: {
        $all: [request.studentId, mentor.userId],
      },
    });

    if (!existingConversation) {
      const conversation = await Conversation.create({
        participants: [request.studentId, mentor.userId],
      });

      console.log("Conversation Created:", conversation);
    }

    res.status(200).json({
      message: "Request accepted and chat created",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// Reject Request
exports.rejectRequest = async (req, res) => {
  try {
    const request = await ConnectionRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        message: "Request already processed",
      });
    }

    request.status = "rejected";

    await request.save();
    const mentorUser = await User.findById(req.user.id);

    await Notification.create({
      recipient: request.studentId,
      sender: req.user.id,
      type: "request_rejected",
      text: `${mentorUser.name} rejected your mentor request`,
    });
    res.status(200).json({
      message: "Request rejected",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};
exports.markMessagesSeen = async (req, res) => {
  try {
    await Message.updateMany(
      {
        conversationId: req.params.id,

        isSeen: false,
      },
      {
        isSeen: true,
      },
    );

    res.status(200).json({
      message: "Messages Seen",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
