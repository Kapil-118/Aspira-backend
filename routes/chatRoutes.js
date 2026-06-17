const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const chatUpload = require("../middleware/chatUpload");
const fileUpload = require("../middleware/cloudFileUpload");
const {
  startConversation,
  getConversations,
  getMessages,
  sendMessage,
  deleteMessage,
  editMessage,
  sendImage,
  sendFile,
  reactToMessage,
  searchMessages,
  deleteForEveryone,
} = require("../controllers/chatController");
router.post("/start/:userId", authMiddleware, startConversation);

router.get("/conversations", authMiddleware, getConversations);

router.get("/messages/:id", authMiddleware, getMessages);

router.post("/send", authMiddleware, sendMessage);
router.post("/react/:messageId", authMiddleware, reactToMessage);
router.post(
  "/send-image",
  authMiddleware,
  chatUpload.single("image"),
  sendImage,
);
router.post("/send-file", authMiddleware, fileUpload.single("file"), sendFile);
router.delete("/message/:id", authMiddleware, deleteMessage);
router.put("/message/:id", authMiddleware, editMessage);
router.get("/search/:conversationId", authMiddleware, searchMessages);
router.put("/delete-for-everyone/:id", authMiddleware, deleteForEveryone);
module.exports = router;
