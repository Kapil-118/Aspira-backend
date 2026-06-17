const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const Notification = require("../models/Notification");

router.get("/", authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user.id,
    })
      .populate("sender", "name")
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

router.put("/read-all", authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.user.id,
        isRead: false,
      },
      {
        isRead: true,
      },
    );

    res.json({
      message: "Updated",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;
